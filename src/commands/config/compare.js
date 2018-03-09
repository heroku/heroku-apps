'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  function lastRelease () {
    return heroku.request({
      method: 'GET',
      partial: true,
      path: `/apps/${context.app}/releases`,
      headers: {Range: 'version ..; order=desc,max=1'}
    }).then((releases) => releases[0])
  }

  let [key, value] = context.args.pair.split('=')

  if (!key || !value) {
    cli.error(`${cli.color.cyan(context.args.pair)} is invalid. Must be in the format ${cli.color.cyan('FOO=bar')}.`)
  }

  let configVars = yield heroku.request({path: `/apps/${context.app}/config-vars`})
  let v = configVars[key]
  if (v === undefined) {
    cli.error(`${cli.color.cyan(context.args.key)} is invalid`)
  } else {
    if (v === context.flags.expected) {
      let config = {}
      config[key] = value
      yield cli.action(
        `Setting ${key} and restarting ${cli.color.app(context.app)}`,
        {success: false},
        co(function * () {
          yield heroku.request({
            method: 'patch',
            path: `/apps/${context.app}/config-vars`,
            body: config
          })
          let release = yield lastRelease()
          cli.action.done(`done, ${cli.color.release('v' + release.version)}`)
          cli.log(`${key}: ${value}`)
        })
      )
    } else {
      cli.error(`${cli.color.cyan(key)} value doesn't match as expected`)
    }
  }
}

module.exports = {
  topic: 'config',
  command: 'compare-and-set',
  description: 'reset a config value if you known the old value',
  help: `Example:

    $ heroku heroku config:compare-and-set FOO=baz --expected bar
    Setting FOO and restarting ⬢ myapp... done, v2
    FOO: baz
 `,
  args: [{name: 'pair'}],
  flags: [{name: 'expected', char: 'e', description: 'key value expected', hasValue: true}],
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
}
