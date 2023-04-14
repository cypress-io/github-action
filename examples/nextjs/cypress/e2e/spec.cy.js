describe('example: nextjs', () => {
  it('loads correctly', () => {
    cy.visit('/')
    cy.contains('Welcome to Next.js!')
  })
})
