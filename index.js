const core = require('@actions/core');
const github = require('@actions/github');
const {getDiff} = require("graphql-schema-diff");

try {
    const oldSchema = core.getInput('old-schema');
    const newSchema = core.getInput('new-schema');
    
    getDiff(oldSchema, newSchema).then(result => {
        if (result) {
            const breaking = result.breakingChanges.length === 0 ? "" : `
### 🚨 Breaking Changes 
${result.breakingChanges.map(x => " - " + x.description).join("\n")}
            `
            
            const dangerous = result.dangerousChanges.length === 0 ? "" : `
### ⚠️ Dangerous Changes
${result.dangerousChanges.map(x => " - " + x.description).join("\n")}
            `
            
            const comment = `
## GraphQL Diff

\`\`\`diff
${result.diffNoColor}
\`\`\`

${breaking}
${dangerous}
            `
            
            const kit = github.getOctokit(core.getInput("token"));
            
            kit.issues.createComment({
                owner: github.context.payload.repository.owner,
                repo: github.context.payload.repository.name,
                issue_number: github.context.payload.pull_request.number,
                body: comment
            });
        } else {
            core.info("No schema changes");
        }
    });
    
    
} catch (error) {
    core.setFailed(error.message);
}