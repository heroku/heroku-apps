const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  let password = yield cli.prompt('Password', {hide: true})
  let headers = {'Heroku-Password': password}
  let codes = yield heroku.post('/account/recovery-codes', {headers: headers})
  cli.log('Recovery codes:')
  for (var i in codes) cli.log(codes[i])
}

const cmd = {
  description: 'generates and replaces recovery codes',
  needsAuth: true,
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku 2fa:generate-recovery-codes
     Password: ***************
     Recovery codes:
     41146052d34095ed
     62e5f92ca3e4f8fe
     0631bdcfdfa839c4
     fde950649490911b
     db8ce8054a60ce5e
     0242cca36d227edd
     c701ed842583efc1
     f6f0de381f4b8bb1
     eb5bf64e1d4195c4
     d9fc5d26c85beba2`
}

module.exports = [
  Object.assign({topic: 'auth', command: '2fa:generate'}, cmd),
  Object.assign({topic: '2fa', command: 'generate-recovery-codes'}, cmd),
  Object.assign({topic: 'twofactor', command: 'generate-recovery-codes'}, cmd)
]
