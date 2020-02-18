it('has all expected env variables', () => {
  // environmentName is set as workflow environment variable
  expect(Cypress.env('environmentName')).to.equal('staging')
})
