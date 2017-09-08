'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
let releases = require('../../releases')

function * run (context, heroku) {
  const shellescape = require('shell-escape')
  const statusHelper = require('../../status_helper')
  const forEach = require('lodash.foreach')

  let release = yield releases.FindByLatestOrId(heroku, context.app, context.args.release)

  let config = yield heroku.get(`/apps/${context.app}/releases/${release.version}/config-vars`)

  if (context.flags.json) {
    cli.styledJSON(release)
  } else {
    let releaseChange = release.description
    let status = statusHelper.description(release)
    let statusColor = statusHelper.color(release.status)
    if (status !== undefined) {
      releaseChange += ' (' + cli.color[statusColor](status) + ')'
    }

    cli.styledHeader(`Release ${cli.color.cyan('v' + release.version)}`)
    cli.styledObject({
      'Add-ons': release.addon_plan_names,
      Change: releaseChange,
      By: release.user.email,
      When: release.created_at
    })

    cli.log()
    cli.styledHeader(`${cli.color.cyan('v' + release.version)} Config vars`)
    if (context.flags.shell) {
      forEach(config, (v, k) => cli.log(`${k}=${shellescape([v])}`))
    } else {
      cli.styledObject(config)
    }
  }
}

module.exports = {
  topic: 'releases',
  command: 'info',
  description: 'view detailed information for a release',
  needsApp: true,
  needsAuth: true,
  args: [{name: 'release', optional: true}],
  flags: [
    {name: 'json', description: 'output in json format'},
    {name: 'shell', char: 's', description: 'output in shell format'}
  ],
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku releases:info --app murmuring-headland-14719
    === Release v9
    Add-ons: heroku-postgresql:hobby-dev
    By:      user@example.com
    Change:  Deploy bl6532a0
    When:    2017-09-05T20:24:25Z

    === v9 Config vars
    DATABASE_URL: postgres://user:postgres-url
`
}
