'use strict'

const {Command, api, app} = require('heroku-command')

class Config extends Command {
  async run () {
    // const shellescape = require('shell-escape')
    // const forEach = require('lodash.foreach')
    // const mapKeys = require('lodash.mapkeys')

    console.log(this.app)
    let configVars = await this.api.get(`/apps/${this.app}/config-vars`)
    console.log(configVars)
    // if (context.flags.shell) {
    //   forEach(configVars, function (v, k) {
    //     cli.log(`${k}=${shellescape([v])}`)
    //   })
    // } else if (context.flags.json) {
    //   cli.styledJSON(configVars)
    // } else {
    //   cli.styledHeader(`${context.app} Config Vars`)
    //   cli.styledObject(mapKeys(configVars, (_, k) => cli.color.configVar(k)))
    // }
  }
}

Config.topic = 'config'
Config.description = 'display the config vars for an app'
Config.mixins = [api(), app()]

module.exports = Config

// module.exports = {
//   needsApp: true,
//   needsAuth: true,
//   flags: [
//     {name: 'shell', char: 's', description: 'output config vars in shell format'},
//     {name: 'json', description: 'output config vars in json format'}
//   ],
//   run: cli.command(co.wrap(run))
// }
