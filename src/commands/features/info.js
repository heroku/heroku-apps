'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  let feature = yield heroku.get(`/apps/${context.app}/features/${context.args.feature}`)

  if (context.flags.json) {
    cli.styledJSON(feature)
  } else {
    cli.styledHeader(feature.name)
    cli.styledObject({
      Description: feature.description,
      Enabled: feature.enabled ? cli.color.green(feature.enabled) : cli.color.red(feature.enabled),
      Docs: feature.doc_url
    })
  }
}

module.exports = {
  topic: 'features',
  command: 'info',
  description: 'display information about a feature',
  args: [{name: 'feature'}],
  flags: [{name: 'json', description: 'output in json format'}],
  needsAuth: true,
  needsApp: true,
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku features:info spaces-dns-discovery --app murmuring-headland-14719 
    === spaces-dns-discovery
    Description: Enable DNS service discovery [general]
    Docs:        contact dogwood@
    Enabled:     false `
}
