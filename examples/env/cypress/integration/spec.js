it('has all expected env variables', () => {
  // environmentName is set as workflow environment variable
  // host and port are set via action's "with: env:" parameter
  expect(Cypress.env()).to.deep.equal({
    host: 'api.dev.local',
    port: 4222,
    environmentName: 'staging'
  })
})
