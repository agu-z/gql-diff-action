const core = require("@actions/core");
const github = require("@actions/github");
const {getDiff} = require("graphql-schema-diff");
const path = require("path");

const header = core.getInput("header");

function resolveHome(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}

const oldSchema = resolveHome(core.getInput("old-schema"));
const newSchema = resolveHome(core.getInput("new-schema"));
const failOnDiff = core.getInput("fail-on-diff") === "true";

getDiff(oldSchema, newSchema).then(async result => {
    const {repo:{owner, repo}, payload: {pull_request: {number}}} = github.context;
    const kit = github.getOctokit(core.getInput("token"));

    const {data: comments} = await kit.issues.listComments({
        owner,
        repo,
        issue_number: number
    });
    
    core.info(JSON.stringify(comments, null, 2))

    const existing = comments.find(comment => comment.body.startsWith(header));
    
    if (result) {
        const breaking = result.breakingChanges.length === 0 ? "" : `
### 🚨 Breaking Changes 
${result.breakingChanges.map(x => " - " + x.description).join("\n")}
        `

        const dangerous = result.dangerousChanges.length === 0 ? "" : `
### ⚠️ Dangerous Changes
${result.dangerousChanges.map(x => " - " + x.description).join("\n")}
        `

        const body = `${header}

<details>
<summary>
View schema changes
</summary>

\`\`\`diff
${result.diffNoColor.split("\n").slice(2).join("\n")}
\`\`\`
</details>

${breaking}
${dangerous}
        `

        if (existing) {
            await kit.issues.updateComment({
                owner,
                repo,
                comment_id: existing.id,
                body,
            });
            
        } else {
            await kit.issues.createComment({
                owner,
                repo,
                issue_number: number,
                body,
            });
        }

        if (failOnDiff) {
            core.setFailed("Schema changes detected.");
        }
    } else {
        core.info("No schema changes.");
        
        if (existing) {
            await kit.issues.deleteComment({
                owner,
                repo,
                comment_id: existing.id
            });
            
            
            core.info("Deleted comment.")
        }
    }
}).catch((err) => core.setFailed(err.message));
    