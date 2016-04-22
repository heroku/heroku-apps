'use strict'

let co = require('co')
let cli = require('heroku-cli-util')
let inquirer = require('inquirer')
let util = require('../../lib/util')

function sshKeygen (file, quiet) {
  let spawn = require('child_process').spawn
  return new Promise(function (resolve, reject) {
    spawn('ssh-keygen', ['-t', 'rsa', '-N', '', '-f', file], {stdio: quiet ? null : 'inherit'})
      .on('close', (code) => code === 0 ? resolve() : reject(code))
  })
}

function confirmPrompt (message) {
  if (process.stdin.isTTY) {
    return inquirer.prompt([{
      type: 'confirm',
      name: 'yes',
      message: message
    }])
  } else {
    return cli.prompt(message + ' [Y/n]').then(function (data) {
      return {yes: /^y(es)?/i.test(data)}
    })
  }
}

function * run (context, heroku) {
  let fs = require('mz/fs')
  let path = require('path')
  let home = require('os-homedir')

  const sshdir = path.join(home(), '.ssh')

  let generate = co.wrap(function * () {
    yield util.mkdirp(sshdir, {mode: 0o700})
    yield sshKeygen(path.join(sshdir, 'id_rsa'), context.flags.quiet)
  })

  let findKey = co.wrap(function * () {
    const defaultKey = path.join(sshdir, 'id_rsa.pub')
    if (!(yield fs.exists(defaultKey))) {
      cli.console.error('Could not find an existing SSH key at ~/.ssh/id_rsa.pub')

      if (!context.flags.yes) {
        let resp = yield confirmPrompt('Would you like to generate a new one?')
        if (!resp.yes) return
      }

      yield generate()
      return defaultKey
    }
    let keys = yield fs.readdir(sshdir)
    keys = keys.map((k) => path.join(sshdir, k))
    keys = keys.filter((k) => path.extname(k) === '.pub')
    if (keys.length === 1) {
      let key = keys[0]
      cli.console.error(`Found an SSH public key at ${cli.color.cyan(key)}`)

      if (!context.flags.yes) {
        let resp = yield confirmPrompt('Would you like to upload it to Heroku?')
        if (!resp.yes) return
      }

      return key
    } else {
      let resp = yield inquirer.prompt([{
        type: 'list',
        name: 'key',
        choices: keys,
        message: 'Which SSH key would you like to upload?'
      }])
      return resp.key
    }
  })

  let upload = co.wrap(function * (key) {
    yield cli.action(`Uploading ${cli.color.cyan(key)} SSH key`, co(function * () {
      yield heroku.request({
        method: 'POST',
        path: '/account/keys',
        body: {
          public_key: yield fs.readFile(key, 'utf8')
        }
      })
    }))
  })

  let key = context.args.key
  if (!key) key = yield findKey()
  if (!key) throw new Error('No key to upload')
  yield upload(key)
}

module.exports = {
  topic: 'keys',
  command: 'add',
  description: 'add an SSH key for a user',
  help: `if no KEY is specified, will try to find ~/.ssh/id_rsa.pub

Examples:

  $ heroku keys:add
  Could not find an existing public key.
  Would you like to generate one? [Yn] y
  Generating new SSH public key.
  Uploading SSH public key /.ssh/id_rsa.pub... done

  $ heroku keys:add /my/key.pub
  Uploading SSH public key /my/key.pub... done
`,
  needsAuth: true,
  args: [{name: 'key', optional: true}],
  flags: [
    {name: 'quiet', hidden: true},
    {name: 'yes', char: 'y', description: 'automatically answer yes for all prompts'}
  ],
  run: cli.command(co.wrap(run))
}
