const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  let password = yield cli.prompt('Password', {hide: true})
  let body = {password: password, two_factor_authentication: false}
  let account = yield heroku.patch('/account', {body: body})
  if (!account.two_factor_authentication) {
    cli.log('Two-factor authentication has been disabled')
  }
}

const cmd = {
  description: 'disable 2fa on account',
  run: cli.command(co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'auth', command: '2fa:disable'}, cmd),
  Object.assign({topic: '2fa', command: 'disable'}, cmd)
]
