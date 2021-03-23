it('spec-A works', () => {
  // make fail on purpose
  expect(42).to.equal(21 + 22)
  cy.visit('https://example.cypress.io').wait(2000)
})
