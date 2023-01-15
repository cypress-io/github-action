console.log('running Cypress from index.js')

const cypress = require('cypress')
const _ = require('lodash')
const fs = require('fs')

cypress.run().then(results => {
  const summary = _.pickBy(results, (value, key) =>
    key.startsWith('total')
  )
  console.log(summary)
  fs.writeFileSync(
    'results.json',
    JSON.stringify(summary, null, 2) + '\n',
    'utf8'
  )
  console.log('saved file results.json')
})
