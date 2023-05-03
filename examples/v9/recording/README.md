# example: recording

The recording example uses [Cypress Cloud](https://docs.cypress.io/guides/cloud/introduction) to record results using the Cypress Cloud `projectId` as defined in the [cypress.json](cypress.json) configuration file.

## Using your own Cypress Cloud project

In order to use the recording example with your own Cypress Cloud project, you need to replace the `projectId` and `record key` with your own values.

Follow the [Cypress Cloud](https://docs.cypress.io/guides/cloud/introduction) documentation to sign up, if you do not already have an account, or to [sign in](https://cloud.cypress.io/) if you have an account.

Create a new project if one does not exist.

Access "Project settings" in Cypress Cloud and copy the contents of each of the following parameters for the project into the Security settings of your GitHub fork, using "Secrets and variables" > "Actions", then "Secrets" for the "Project ID" and for the "Record Key" as in the table below:

| Cypress Cloud name | Actions name in fork  | Variable type   |
| ------------------ | --------------------- | --------------- |
| Project ID         | EXAMPLE_PROJECT_ID    | Actions secrets |
| Record Keys        | EXAMPLE_RECORDING_KEY | Actions secrets |

Refer to the GitHub documentation
- [Creating encrypted secrets for a repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

When you have done this, the example recording will take the `projectId` from the `EXAMPLE_PROJECT_ID` variable instead of from the [cypress.json](cypress.json) configuration file.

This setup allows the example recording to run in your own Cypress Cloud project, whilst leaving the same example for use in the parent repository [cypress-io/github-action](https://github.com/cypress-io/github-action) unchanged. The parent repository has its own `EXAMPLE_RECORDING_KEY` defined as a secret and it uses the `projectId` as defined in the [cypress.json](cypress.json) configuration file.
