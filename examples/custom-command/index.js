console.log('running Cypress from index.js')

import cypress from 'cypress'
import _ from 'lodash'
import fs from 'node:fs'

cypress.run().then((results) => {
  const summary = _.pickBy(results, (value, key) =>
    key.startsWith('total'),
  )
  console.log(summary)
  fs.writeFileSync(
    'results.json',
    JSON.stringify(summary, null, 2) + '\n',
    'utf8',
  )
  console.log('saved file results.json')
})
