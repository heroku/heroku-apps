'use strict'

let time = require('../../lib/time')

// gets the process number from a string like web.19 => 19
let getProcessNum = (s) => parseInt(s.split('.', 2)[1])

const {Command, mixins} = require('heroku-cli-command')

class PS extends mixins.mix(Command).with(mixins.app(), mixins.heroku()) {
  async run () {
    const types = this.args
    const {json, extended} = this.flags
    const suffix = extended ? '?extended=true' : ''

    let promises = [
      this.api.get(`/apps/${this.app}/dynos${suffix}`)
    ]

    if (!json && !extended) {
      promises.push(this.api.get(`/apps/${this.app}`, {
        headers: {Accept: 'application/vnd.heroku+json; version=3.process-tier'}
      }))
      promises.push(this.api.get('/account'))
    }

    let [dynos, appInfo, accountInfo] = await Promise.all(promises)

    if (types.length > 0) {
      dynos = dynos.filter(dyno => types.find(t => dyno.type === t))
      types.forEach(t => {
        if (!dynos.find(d => d.type === t)) {
          throw new Error(`No ${this.color.cyan(t)} dynos on ${this.color.app(this.app)}`)
        }
      })
    }

    if (json) this.styledJSON(dynos)
    else if (extended) this.printExtended(dynos)
    else {
      await this.printAccountQuota(appInfo, accountInfo)
      if (dynos.length === 0) this.log(`No dynos on ${this.color.app(this.app)}`)
      else this.printDynos(dynos)
    }
  }

  printExtended (dynos) {
    const truncate = require('lodash.truncate')
    const sortBy = require('lodash.sortby')
    const trunc = (s) => truncate(s, {length: 35, omission: '…'})

    dynos = sortBy(dynos, ['type'], (a) => getProcessNum(a.name))
    this.table(dynos, {
      columns: [
        {key: 'id', label: 'ID'},
        {key: 'name', label: 'Process'},
        {key: 'state', label: 'State', format: (state, row) => `${state} ${time.ago(new Date(row.updated_at))}`},
        {key: 'extended.region', label: 'Region'},
        {key: 'extended.instance', label: 'Instance'},
        {key: 'extended.ip', label: 'IP'},
        {key: 'extended.port', label: 'Port'},
        {key: 'extended.az', label: 'AZ'},
        {key: 'release.version', label: 'Release'},
        {key: 'command', label: 'Command', format: trunc},
        {key: 'extended.route', label: 'Route'},
        {key: 'size', label: 'Size'}
      ]
    })
  }

  async printAccountQuota (app, account) {
    if (app.process_tier !== 'free') {
      return
    }

    let quota = await this.api.request({
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

    this.log(`Free dyno hours quota remaining this month: ${hours}h ${minutes}m (${percentage}%)`)
    this.log('For more information on dyno sleeping and how to upgrade, see:')
    this.log('https://devcenter.heroku.com/articles/dyno-sleeping')
    this.log()
  }

  printDynos (dynos) {
    const reduce = require('lodash.reduce')
    const forEach = require('lodash.foreach')

    let dynosByCommand = reduce(dynos, (dynosByCommand, dyno) => {
      let since = time.ago(new Date(dyno.updated_at))
      let size = dyno.size || '1X'

      if (dyno.type === 'run') {
        let key = 'run: one-off processes'
        if (dynosByCommand[key] === undefined) dynosByCommand[key] = []
        dynosByCommand[key].push(`${dyno.name} (${size}): ${dyno.state} ${since}: ${dyno.command}`)
      } else {
        let key = `${this.color.green(dyno.type)} (${this.color.cyan(size)}): ${dyno.command}`
        if (dynosByCommand[key] === undefined) dynosByCommand[key] = []
        let state = dyno.state === 'up' ? this.color.green(dyno.state) : this.color.yellow(dyno.state)
        let item = `${dyno.name}: ${this.color.green(state)} ${this.color.dim(since)}`
        dynosByCommand[key].push(item)
      }
      return dynosByCommand
    }, {})
    forEach(dynosByCommand, (dynos, key) => {
      this.styledHeader(`${key} (${this.color.yellow(dynos.length)})`)
      dynos = dynos.sort((a, b) => getProcessNum(a) - getProcessNum(b))
      for (let dyno of dynos) this.log(dyno)
      this.log()
    })
  }

}

PS.topic = 'ps'
PS.description = 'list dynos for an app'
PS.variableArgs = true
PS.usage = 'ps [TYPE [TYPE ...]]'
PS.flags = [
  {name: 'json', description: 'display as json'},
  {name: 'extended', char: 'x', hidden: true}
]
PS.help = `
Examples:

 $ heroku ps
 === run: one-off dyno
 run.1: up for 5m: bash

 === web: bundle exec thin start -p $PORT
 web.1: created for 30s

 $ heroku ps run # specifying types
 === run: one-off dyno
 run.1: up for 5m: bash`

module.exports = PS
