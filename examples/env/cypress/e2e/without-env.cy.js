import semver from 'semver'

// Cypress.env is deprecated in Cypress 15.10.0 and removed in
// Cypress 16.0.0. The test is retained as an example for Cypress <15.10.0 users
// See the migration guide for more information:
// https://docs.cypress.io/guides/references/migration-guide#Cypress-env

if (semver.gte(Cypress.version, '15.10.0')) {
  it('skipping Cypress.env tests for Cypress >=15.10.0', () => {})
}
else {
  it('has all expected env variables', () => {
    // environmentName is set as workflow environment variable
    expect(
      Cypress.env('environmentName'),
      'has environment name',
    ).to.equal('staging')
  })
}
