it('has all expected env variables', () => {
  // environmentName is set as workflow environment variable
  expect(
    Cypress.env('environmentName'),
    'has environment name'
  ).to.equal('staging')
})
