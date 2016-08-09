'use strict'

const cli = require('heroku-cli-util')
const co = require('co')

function render (opts) {
  const {release, config, context, v2} = opts
  const statusHelper = require('./status_helper')
  const shellescape = require('shell-escape')
  const forEach = require('lodash.foreach')

  let releaseChange = release.description
  let status = statusHelper(release.status)
  if (status.content !== undefined) {
    releaseChange += ' (' + cli.color[status.color](status.content) + ')'
  }

  cli.styledHeader(`Release ${cli.color.cyan('v' + release.version)}`)
  cli.styledObject({
    'Add-ons': v2 ? v2.addons : null,
    Change: releaseChange,
    By: release.user.email,
    When: release.created_at
  })
  if (config) {
    cli.log()
    cli.styledHeader(`${cli.color.cyan('v' + release.version)} Config vars`)
    if (context.flags.shell) {
      forEach(config, (v, k) => cli.log(`${k}=${shellescape([v])}`))
    } else {
      cli.styledObject(config)
    }
  }
}

function * run (context, heroku) {
  function latestReleaseID () {
    return heroku.get(`/apps/${app}/releases`, {
      partial: true,
      headers: {Range: 'version ..; max=1, order=desc'}
    }).then(releases => releases[0].version)
  }

  const {app} = context
  let id = (context.args.release || 'current').toLowerCase()
  id = id.startsWith('v') ? id.slice(1) : id
  if (id === 'current') id = yield latestReleaseID()

  let [release, config, v2] = yield [
    heroku.get(`/apps/${app}/releases/${id}`),
    heroku.get(`/apps/${app}/releases/${id}/config-vars`).catch(() => {}),
    heroku.get(`/apps/${app}/releases/${id}`, {
      headers: {Accept: 'application/json'}
    }).catch(() => {})
  ]

  if (context.flags.json) {
    release.config = config
    if (v2) release.addons = v2.addons
    cli.styledJSON(release)
  } else {
    render({release, config, context, v2})
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
  run: cli.command(co.wrap(run))
}
