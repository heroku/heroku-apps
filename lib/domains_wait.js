'use strict'

let cli = require('heroku-cli-util')

function waitForDomain () {
  return function (context, heroku, domain) {
    if (domain.status === 'pending') {
      return heroku.request({
        path: `/apps/${context.app}/domains/${domain.id}`
      })
      .then(function (domain) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            return resolve(waitForDomain()(context, heroku, domain))
          }, 5000)
        })
      })
    } else {
      return new Promise(function (resolve, reject) {
        if (domain.status === 'succeeded' || domain.status === 'none') {
          resolve(domain)
        } else {
          reject(new Error(`The domain creation finished with status ${domain.status}`))
        }
      })
    }
  }
}

module.exports = function * (context, heroku, domain) {
  yield cli.action(`Waiting for ${cli.color.green(domain.hostname)}`, waitForDomain()(context, heroku, domain))
}
