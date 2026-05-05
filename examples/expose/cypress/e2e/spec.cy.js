it('has all expected expose variables', () => {
  expect(Cypress.expose('host'), 'host is an URL').to.match(
    /^https?:\/\//,
  )
  expect(
    Cypress.expose(),
    'full expose includes API info',
  ).to.deep.include({
    host: 'http://api.dev.local',
    apiPort: 4222,
  })
})
