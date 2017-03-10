const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  let password = yield cli.prompt('Password', {hide: true})
  let headers = {'Heroku-Password': password}
  let codes = yield heroku.post('/account/recovery-codes', {headers: headers})
  cli.log('Recovery codes:')
  cli.log(codes)
}

const cmd = {
  description: 'generates and replaces recovery codes',
  run: cli.command(co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'auth', command: '2fa:generate'}, cmd),
  Object.assign({topic: '2fa', command: 'generate'}, cmd)
]
