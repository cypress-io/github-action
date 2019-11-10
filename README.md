# @cypress/github-action
> [GitHub Action](https://help.github.com/en/actions) for running [Cypress](https://www.cypress.io) end-to-end tests

## Examples

### Basic

```yml
name: End-to-end tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      # Install NPM dependencies, cache them correctly
      # and run all Cypress tests
      - name: Cypress run
        uses: @cypress/github-action
```

## More information

- [Building actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/building-actions) docs

## License

[MIT License](./LICENSE.md)
