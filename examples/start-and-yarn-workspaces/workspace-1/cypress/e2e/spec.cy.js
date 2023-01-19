it('loads the page', () => {
  cy.visit('/')
  cy.contains('This is a page, from workspace-1').should('be.visible')
})
