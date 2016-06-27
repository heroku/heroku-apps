'use strict'

let cli = require('heroku-cli-util')
let co = require('co')
let time = require('../../lib/time')

// gets the process number from a string like web.19 => 19
let getProcessNum = (s) => parseInt(s.split('.', 2)[1])

function printExtended (dynos) {
  const truncate = require('lodash.truncate')
  const sortBy = require('lodash.sortby')
  const trunc = (s) => truncate(s, {length: 35, omission: '…'})

  dynos = sortBy(dynos, ['type'], (a) => getProcessNum(a.name))
  cli.table(dynos, {
    columns: [
      {key: 'id', label: 'ID'},
      {key: 'name', label: 'Process'},
      {key: 'state', label: 'State', format: (state, row) => `${state} ${time.ago(new Date(row.updated_at))}`},
      {key: 'extended.region', label: 'Region'},
      {key: 'extended.instance', label: 'Instance'},
      {key: 'extended.port', label: 'Port'},
      {key: 'extended.az', label: 'AZ'},
      {key: 'release.version', label: 'Release'},
      {key: 'command', label: 'Command', format: trunc},
      {key: 'extended.route', label: 'Route'},
      {key: 'size', label: 'Size'}
    ]
  })
}

function * printAccountQuota (context, heroku, app, account) {
  if (app.process_tier !== 'free') {
    return
  }

  let quota = yield heroku.request({
    path: `/accounts/${account.id}/actions/get-quota`,
    headers: {Accept: 'application/vnd.heroku+json; version=3.account-quotas'}
  })
  .then(function (data) {
    // very temporary fix, the person who can fix this is on vacation
    if (data.id === 'not_found') {
      return null
    }
    return data
  })
  .catch(function () {
    return null
  })

  if (!quota) return

  let remaining, percentage
  if (quota.account_quota === 0) {
    remaining = 0
    percentage = 0
  } else {
    remaining = quota.account_quota - quota.quota_used
    percentage = Math.floor(remaining / quota.account_quota * 100)
  }

  let remainingMinutes = remaining / 60
  let hours = Math.floor(remainingMinutes / 60)
  let minutes = Math.floor(remainingMinutes % 60)

  cli.log(`Free dyno hours quota remaining this month: ${hours}h ${minutes}m (${percentage}%)`)
  cli.log('For more information on dyno sleeping and how to upgrade, see:')
  cli.log('https://devcenter.heroku.com/articles/dyno-sleeping')
  cli.log()
}

function printDynos (dynos) {
  const reduce = require('lodash.reduce')
  const forEach = require('lodash.foreach')

  let dynosByCommand = reduce(dynos, function (dynosByCommand, dyno) {
    let since = time.ago(new Date(dyno.updated_at))
    let size = dyno.size || '1X'

    if (dyno.type === 'run') {
      let key = 'run: one-off processes'
      if (dynosByCommand[key] === undefined) dynosByCommand[key] = []
      dynosByCommand[key].push(`${dyno.name} (${size}): ${dyno.state} ${since}: ${dyno.command}`)
    } else {
      let key = `${cli.color.green(dyno.type)} (${cli.color.cyan(size)}): ${dyno.command}`
      if (dynosByCommand[key] === undefined) dynosByCommand[key] = []
      let state = dyno.state === 'up' ? cli.color.green(dyno.state) : cli.color.yellow(dyno.state)
      let item = `${dyno.name}: ${cli.color.green(state)} ${cli.color.gray(since)}`
      dynosByCommand[key].push(item)
    }
    return dynosByCommand
  }, {})
  forEach(dynosByCommand, function (dynos, key) {
    cli.styledHeader(`${key} (${cli.color.yellow(dynos.length)})`)
    dynos = dynos.sort((a, b) => getProcessNum(a) - getProcessNum(b))
    for (let dyno of dynos) cli.log(dyno)
    cli.log()
  })
}

function * run (context, heroku) {
  const {app, flags, args} = context
  const types = args
  const {json, extended} = flags
  const suffix = extended ? '?extended=true' : ''

  let promises = {
    dynos: heroku.request({path: `/apps/${app}/dynos${suffix}`})
  }

  if (!json && !extended) {
    promises.app_info = heroku.request({
      path: `/apps/${context.app}`,
      headers: {Accept: 'application/vnd.heroku+json; version=3.process-tier'}
    })
    promises.account_info = heroku.request({path: '/account'})
  }

  let {dynos, app_info, account_info} = yield promises

  if (types.length > 0) {
    dynos = dynos.filter(dyno => types.find(t => dyno.type === t))
    types.forEach(t => {
      if (!dynos.find(d => d.type === t)) {
        throw new Error(`No ${cli.color.cyan(t)} dynos on ${cli.color.app(app)}`)
      }
    })
  }

  if (json) cli.styledJSON(dynos)
  else if (extended) printExtended(dynos)
  else {
    yield printAccountQuota(context, heroku, app_info, account_info)
    if (dynos.length === 0) cli.log(`No dynos on ${cli.color.app(app)}`)
    else printDynos(dynos)
  }
}

module.exports = {
  topic: 'ps',
  description: 'list dynos for an app',
  variableArgs: true,
  usage: 'ps [TYPE [TYPE ...]]',
  flags: [
    {name: 'json', description: 'display as json'},
    {name: 'extended', char: 'x', hidden: true}
  ],
  help: `
Examples:

 $ heroku ps
 === run: one-off dyno
 run.1: up for 5m: bash

 === web: bundle exec thin start -p $PORT
 web.1: created for 30s

 $ heroku ps run # specifying types
 === run: one-off dyno
 run.1: up for 5m: bash`,
  needsAuth: true,
  needsApp: true,
  run: cli.command(co.wrap(run))
}
