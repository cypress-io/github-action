it('spec-D works', () => {
  expect(42).to.equal(21 + 21)
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.visit('https://example.cypress.io').wait(3600)
})
