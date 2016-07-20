'use strict'

const cli = require('heroku-cli-util')
const co = require('co')

function styledDrain (id, name, drain) {
  let output = `${id} (${name})`
  if (drain.extended) output = output + ` drain_id=${drain.extended.drain_id}`
  cli.log(output)
}

function * run (context, heroku) {
  const zip = require('lodash.zip')
  const partition = require('lodash.partition')

  let path = `/apps/${context.app}/log-drains`
  if (context.flags.extended) path = path + '?extended=true'
  let drains = yield heroku.get(path)
  if (context.flags.json) {
    cli.styledJSON(drains)
  } else {
    let [addonDrains, appDrains] = partition(drains, 'addon')
    let addons = zip(addonDrains, yield addonDrains.map(d => heroku.get(`/apps/${context.app}/addons/${d.addon.name}`)))
    if (appDrains.length > 0) {
      cli.styledHeader('Drains')
      appDrains.forEach(drain => {
        styledDrain(drain.url, cli.color.green(drain.token), drain)
      })
    }
    if (addons.length > 0) {
      cli.styledHeader('Add-on Drains')
      addons.forEach(d => {
        let [drain, addon] = d
        styledDrain(cli.color.yellow(addon.plan.name), cli.color.green(addon.name), drain)
      })
    }
  }
}

module.exports = {
  topic: 'drains',
  description: 'display the log drains of an app',
  needsApp: true,
  needsAuth: true,
  flags: [
    {name: 'json', description: 'output in json format'},
    {name: 'extended', char: 'x', hidden: true}
  ],
  run: cli.command(co.wrap(run))
}
