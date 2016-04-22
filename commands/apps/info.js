'use strict'

let _ = require('lodash')
let S = require('string')
let co = require('co')
let cli = require('heroku-cli-util')
let extend = require('util')._extend
let filesize = require('filesize')
let util = require('util')

function * run (context, heroku) {
  function getInfo (app) {
    return {
      addons: heroku.apps(app).addons().listByApp(),
      app: heroku.get(context.flags.extended ? `/apps/${app}?extended=true` : `/apps/${app}`),
      dynos: heroku.apps(app).dynos().list().catch(() => []),
      collaborators: heroku.apps(app).collaborators().list().catch(() => []),
      pipeline: heroku.get(`/apps/${app}/pipeline-couplings`).catch(() => null)
    }
  }

  let app = context.args.app || context.app
  if (!app) throw new Error('No app specified.\nUSAGE: heroku info my-app')
  let info = yield getInfo(app)
  let addons = _(info.addons).map('plan.name').sort().value()
  let collaborators = _(info.collaborators).map('user.email').pull(info.app.owner.email).sort().value()

  function print () {
    let data = {}
    data.Addons = addons
    data.Collaborators = collaborators

    if (info.app.archived_at) data['Archived At'] = cli.formatDate(new Date(info.app.archived_at))
    if (info.app.cron_finished_at) data['Cron Finished At'] = cli.formatDate(new Date(info.app.cron_finished_at))
    if (info.app.cron_next_run) data['Cron Next Run'] = cli.formatDate(new Date(info.app.cron_next_run))
    if (info.app.database_size) data['Database Size'] = filesize(info.app.database_size, {round: 0})
    if (info.app.create_status !== 'complete') data['Create Status'] = info.app.create_status
    if (info.app.space) data['Space'] = info.app.space.name
    if (info.pipeline) data['Pipeline'] = `${info.pipeline.pipeline.name} - ${info.pipeline.stage}`

    data['Git URL'] = info.app.git_url
    data['Web URL'] = info.app.web_url
    data['Repo Size'] = filesize(info.app.repo_size, {round: 0})
    data['Slug Size'] = filesize(info.app.slug_size, {round: 0})
    data['Owner'] = info.app.owner.email
    data['Region'] = info.app.region.name
    data['Dynos'] = _(info.dynos).countBy('type').value()
    data['Stack'] = info.app.stack.name

    cli.styledHeader(info.app.name)
    cli.styledObject(data)

    if (context.flags.extended) {
      console.log('\n\n--- Extended Information ---\n\n')
      cli.debug(info.app.extended)
    }
  }

  function shell () {
    function print (k, v) {
      cli.log(`${S(k).slugify()}=${v}`)
    }
    print('addons', addons)
    print('collaborators', collaborators)

    if (info.app.archived_at) print('archived_at', cli.formatDate(new Date(info.app.archived_at)))
    if (info.app.cron_finished_at) print('cron_finished_at', cli.formatDate(new Date(info.app.cron_finished_at)))
    if (info.app.cron_next_run) print('cron_next_run', cli.formatDate(new Date(info.app.cron_next_run)))
    if (info.app.database_size) print('database_size', filesize(info.app.database_size, {round: 0}))
    if (info.app.create_status !== 'complete') print('create_status', info.app.create_status)
    if (info.pipeline) print('pipeline', `${info.pipeline.pipeline.name}:${info.pipeline.stage}`)

    print('git_url', info.app.git_url)
    print('web_url', info.app.web_url)
    print('repo_size', filesize(info.app.repo_size, {round: 0}))
    print('slug_size', filesize(info.app.slug_size, {round: 0}))
    print('owner', info.app.owner.email)
    print('region', info.app.region.name)
    print('dynos', util.inspect(_(info.dynos).countBy('type').value()))
    print('stack', info.app.stack.name)
  }

  if (context.flags.shell) {
    shell()
  } else if (context.flags.json) {
    cli.styledJSON(info)
  } else {
    print()
  }
}

let cmd = {
  topic: 'apps',
  command: 'info',
  description: 'show detailed app information',
  help: `Examples:

 $ heroku apps:info
 === example
 Git URL:   https://git.heroku.com/example.git
 Repo Size: 5M
 ...

 $ heroku apps:info --shell
 git_url=https://git.heroku.com/example.git
 repo_size=5000000
 ...`,
  wantsApp: true,
  needsAuth: true,
  args: [{name: 'app', hidden: true, optional: true}],
  flags: [
    {name: 'shell', char: 's', description: 'output more shell friendly key/value pairs'},
    {name: 'extended', char: 'x', hidden: true},
    {name: 'json', char: 'j'}
  ],
  run: cli.command(co.wrap(run))
}

module.exports.apps = cmd
module.exports.root = extend({}, cmd)
module.exports.root.topic = 'info'
delete module.exports.root.command
