it('loads the page', () => {
  cy.visit('/')
  cy.contains('This is a page').should('be.visible')
})
