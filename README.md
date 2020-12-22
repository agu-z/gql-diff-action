# gql-diff-action

Posts a nice summary of the changes you made to your GraphQL schema in your Pull Request.

## Inputs

### `token`

A GitHub token used to post a comment to your PR

### `old-schema`

The schema before the change. This can be a GraphQL SDL file or an endpoint URL.

### `new-schema`

The schema after the change. This can be a GraphQL SDL file or an endpoint URL.

## Example usage

```yaml
uses: agu-z/gql-diff-action@v0.3
with:
  token: '${{ secrets.GITHUB_TOKEN }}'
  old-schema: '~/old-schema.gql'
  new-schema: '~/new-schema.gql'
```

The way you generate old and new schema files is up to you. 


The following example generates both schemas by running the server before and after the PR change:

```yaml
name: GraphQL diff

on: pull_request

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v1
        with:
          node-version: 12.x
        
      - name: Generate new schema
        run: |
          npm install       # Install dependencies
          npm start &       # Start your server in the background
          SERVER_PID=$!     # Store server pid in order to stop it afterwards
          
          # Generate the new schema
          npx get-graphql-schema http://localhost:5000 ~/new-schema.gql
          
          kill $SERVER_PID  # Stop server. This is necessary to free up the port.
           
      - name: Check out PR base ref
        run: |
          git checkout ${{ github.event.pull_request.base.sha }}
         
      - name: Generate old schema
        run: |
          npm install       # Install dependencies
          npm start &       # Start your server in the background
          SERVER_PID=$!     # Store server pid in order to stop it afterwards

          # Generate the old schema
          npx get-graphql-schema http://localhost:5000 ~/old-schema.gql

          kill $SERVER_PID  # Stop server
          
      - uses: agu-z/gql-diff-action@v0.3
        with:
          token: '${{ secrets.GITHUB_TOKEN }}'
          old-schema: '~/old-schema.gql'
          new-schema: '~/new-schema.gql'

```

--

Agustin Zubiaga 2020

MIT licensed.