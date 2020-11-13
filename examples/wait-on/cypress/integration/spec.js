/// <reference types="cypress" />
describe('example: wait-on', () => {
  it('responds', () => {
    cy.request('/')
      .its('body')
      .should('equal', 'all good')
  })
})
