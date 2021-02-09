# Development

## Testing via examples

1. Add a new example project in `examples` folder. It is a regular NPM package with its own `package.json` and Cypress dev dependency.
1. Add a corresponding `.github/workflows` YAML file that uses this action and runs inside `examples/X` working directory. The example should demonstrate the feature
1. Add workflow badge to README if needed

## Testing against another repo

1. Create a new local branch for any development, for example `git checkout -b featureA`
1. Update the source code in [index.js](index.js)
1. Build `dist` file(s) using `npm run build`
1. Commit any changed files, note the SHA of the commit
1. Push the local branch to GitHub
1. In a test repository, create a test branch, change the action to point at the new commit. Example

```yml
name: End-to-end tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2
      # use specific commit pushed to GitHub
      - uses: cypress-io/github-action@2a1baeb
```

You can use [cypress-gh-action-example](https://github.com/bahmutov/cypress-gh-action-example) or [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) as test projects.

7. Push the change and make sure the new feature performs correctly. If yes, open a pull request.

**For pull request reviewers:**

1. When merging a pull request, squash all commits into one.
1. Make sure the commit subject and body follow [semantic commit convention](https://semantic-release.gitbook.io/semantic-release/#commit-message-format). I prefer simplicity:

```text
feat: added new parameter
fix: fixed a bug
```

If you need to bump major version, mark it as breaking change in the body of the commit's message like:

```text
fix: upgrade dependency X

BREAKING CHANGE: requires Node 8 to run
```

3. New versions of this action will be released automatically by the CI, see [.github/workflows/main.yml](.github/workflows/main.yml). This will create a new [GitHub release](https://github.com/cypress-io/github-action/releases) and will update the current `/v1` branch. Thus every user that use `- uses: cypress-io/github-action@v2` will be using the new version automatically.

## Updating the latest version in GitHub Marketplace

Seems to be a manual process right now. After a new release has been created, go to the release and click "Edit"

![Edit the release](images/edit-release.png)

Review the release info, make sure the "publish ..." checkbox is checked

![Review the release](images/review-release.png)

After clicking "Update the release" check that the Marketplace [https://github.com/marketplace/actions/cypress-io](https://github.com/marketplace/actions/cypress-io) has been updated.

![Latest release in marketplace](images/latest-release.png)
