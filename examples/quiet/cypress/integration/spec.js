it('works', () => {
  expect(42).to.equal(21 + 21)
  cy.visit('https://example.cypress.io')
  // runner includes the application in the viewport
  // and the reporter showing the command log
  cy.screenshot('runner', { capture: 'runner' })
  // just the visible portion of the viewport
  cy.screenshot('viewport', { capture: 'viewport' })
  // you can take the screenshot of the entire page
  // which will be stitched into one tall image
  cy.screenshot('fullPage', { capture: 'fullPage' })

  // log the top window's dimensions
  const resolution = Cypress._.pick(top, [
    'innerWidth',
    'innerHeight'
  ])
  cy.task(
    'log',
    `top window inner w, h is ${resolution.innerWidth}x${resolution.innerHeight}`
  )
})
