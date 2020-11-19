/// <reference types="cypress" />
describe('example: react-scripts', () => {
  it('loads correctly', () => {
    cy.visit('/')
    cy.contains('Hi there')
  })
})
