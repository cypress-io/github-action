/// <reference types="cypress" />
describe('example: install-only', () => {
  it('loads the deployed site', () => {
    cy.visit('/')
    cy.contains('h1', 'Kitchen Sink')
  })
})
