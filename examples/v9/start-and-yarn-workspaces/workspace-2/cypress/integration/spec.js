it('loads the page', () => {
  cy.visit('/')
  cy.contains('This is a page, from workspace-2').should('be.visible')
})
