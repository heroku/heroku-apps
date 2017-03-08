const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  yield cli.login({save: true, sso: context.flags.sso})
  let account = yield heroku.get('/account')
  cli.log(`Logged in as ${account.email}`)
}

const cmd = {
  description: 'login with your Heroku credentials',
  flags: [
    {name: 'sso', description: 'login for enterprise users under SSO'}
  ],
  run: cli.command(co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'auth', command: 'login'}, cmd),
  Object.assign({topic: 'login'}, cmd)
]
