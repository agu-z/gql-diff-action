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
uses: agu-z/gql-diff-action
with:
  token: '${{GITHUB_TOKEN}}'
  old-schema: '~/old-schema.gql'
  new-schema: '~/new-schema.gql'
```

--

Agustin Zubiaga 2020

MIT licensed.