/// <reference types="cypress" />
describe('example: wait-on-vite', () => {
  it('loads', () => {
    cy.visit('/')
    cy.contains('h1', 'Hello Vite!').should('be.visible')
  })
})
