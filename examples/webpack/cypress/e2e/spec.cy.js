/// <reference types="cypress" />
describe('example: webpack-dev-server', () => {
  it('loads correctly', () => {
    cy.visit('/')
    cy.contains('h1', 'Webpack') // static node
    cy.contains('Hi from Webpack').should('be.visible') // created dynamically
  })
})
