# example: component-tests

This example was built as follows:

1. [Vite > Getting Started](https://vitejs.dev/guide/) instructions with the [react](https://vite.new/react) template were used to create the app
    ```bash
    npm create vite@latest component-tests -- --template react
    ```
    The linting `npm` modules and linting script have been removed, since this is out-of-scope for the example.
1. The Cypress documentation instructions from [Component Testing > Getting Started](https://on.cypress.io/guides/component-testing/getting-started) were followed to set up component testing, including copying

    - `<Stepper />` component: [react/my-awesome-app/src/components/Stepper.jsx](https://github.com/cypress-io/component-testing-quickstart-apps/blob/main/react/my-awesome-app/src/components/Stepper.jsx)

    from the [Cypress Component Testing Quickstart Apps](https://github.com/cypress-io/component-testing-quickstart-apps) repo to this repo's `examples/component-tests/src/components/` sub-directory.
1. The script `"test": "cypress run --component"` was added to `package.json`.
## Execution

Execute the following to change to this directory:

```bash
cd examples/component-tests
```

Install dependencies with:

```bash
npm ci
```

Run Cypress component testing with:

```bash
npm test
```
