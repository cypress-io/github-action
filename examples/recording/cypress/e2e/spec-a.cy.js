it('spec-A works', () => {
  expect(42).to.equal(21 + 21)
  cy.visit('https://example.cypress.io').wait(2000)
})
