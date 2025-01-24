describe('example: nextjs', () => {
  it('loads correctly', () => {
    cy.visit('/')
    cy.title().should('eq', 'Create Next App')
    cy.contains('Read our docs')
  })
})
