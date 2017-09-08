'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  let drain = yield heroku.request({
    method: 'delete',
    path: `/apps/${context.app}/log-drains/${encodeURIComponent(context.args.url)}`
  })
  cli.log(`Successfully removed drain ${cli.color.cyan(drain.url)}`)
}

module.exports = {
  topic: 'drains',
  command: 'remove',
  description: 'removes a log drain from an app',
  needsApp: true,
  needsAuth: true,
  args: [{name: 'url'}],
  usage: 'drains:remove [URL|TOKEN]',
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku drains:remove https://my.serverlog.drain --app murmuring-headland-14719
    Successfully removed drain https://my.serverlog.drain`
}
