const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  yield cli.logout()
  cli.log('Local credentials cleared')
}

const cmd = {
  description: 'clear credentials for the current logged in user',
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku auth:logout
    Local credentials cleared`
}

module.exports = [
  Object.assign({topic: 'auth', command: 'logout'}, cmd),
  Object.assign({topic: 'logout'}, cmd)
]
