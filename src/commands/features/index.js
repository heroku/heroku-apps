'use strict'

const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  const sortBy = require('lodash.sortby')
  const S = require('string')

  let features = yield heroku.get(`/apps/${context.app}/features`)
  features = features.filter((f) => f.state === 'general')
  features = sortBy(features, 'name')

  if (context.flags.json) {
    cli.styledJSON(features)
  } else {
    cli.styledHeader(`App Features ${cli.color.app(context.app)}`)
    let longest = Math.max.apply(null, features.map((f) => f.name.length))
    for (let f of features) {
      let line = `${f.enabled ? '[+]' : '[ ]'} ${S(f.name).padRight(longest)}`
      if (f.enabled) line = cli.color.green(line)
      line = `${line}  ${f.description}`
      cli.log(line)
    }
  }
}

module.exports = {
  topic: 'features',
  description: 'list available app features',
  needsApp: true,
  needsAuth: true,
  flags: [
    {name: 'json', description: 'output in json format'}
  ],
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku features --app murmuring-headland-14719
    === App Features ⬢ murmuring-headland-14719
    [ ] http-session-affinity  Enable session affinity for all requests [general]                                                                                           
    [ ] preboot                Provide seamless web dyno deploys [general]
    [ ] spaces-dns-discovery   Enable DNS service discovery [general] `
}
