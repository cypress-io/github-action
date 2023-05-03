it('has all expected env variables', () => {
  // environmentName is set as workflow environment variable
  // as a precaution we can confirm the variable was set
  expect(Cypress.env('environmentName'), 'environment').to.be.a(
    'string'
  )
  // and we can confirm its value
  expect(
    Cypress.env('environmentName'),
    'environment name is staging'
  ).to.equal('staging')

  // host and port are set via action's "with: env:" parameter
  expect(Cypress.env(), 'full env includes API info').to.deep.include(
    {
      host: 'http://api.dev.local',
      apiPort: 4222
    }
  )
  // we can confirm that host is an url
  expect(Cypress.env('host'), 'host is an URL').to.match(
    /^https?:\/\//
  )
})
