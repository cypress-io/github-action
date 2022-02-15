/// <reference types="cypress" />
describe('Example config B', () => {
  it('has baseUrl', () => {
    expect(Cypress.config('baseUrl')).to.equal(
      'http://localhost:3333'
    )
  })

  it('loads the page', () => {
    cy.visit('/')
    cy.contains('This is a page').should('be.visible')
  })

  it.skip('fails on purpose', () => {
    // to verify that the action exits correctly
    expect(false).to.be.true
  })
})
