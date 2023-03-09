/// <reference types="cypress" />
describe('example: yarn-classic', () => {
  it('loads the deployed site', () => {
    cy.visit('/')
    cy.contains('h1', 'Kitchen Sink')
  })
})
