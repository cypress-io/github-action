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
    // as a precaution we can confirm the variable was set
    expect(Cypress.env('environmentName'), 'environment').to.be.a(
      'string',
    )
    // and we can confirm its value
    expect(
      Cypress.env('environmentName'),
      'environment name is staging',
    ).to.equal('staging')

    // host and port are set via action's "with: env:" parameter
    expect(Cypress.env(), 'full env includes API info').to.deep.include(
      {
        host: 'http://api.dev.local',
        apiPort: 4222,
      },
    )
    // we can confirm that host is an url
    expect(Cypress.env('host'), 'host is an URL').to.match(
      /^https?:\/\//,
    )
  })
}
