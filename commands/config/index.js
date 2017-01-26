'use strict'

const cli = require('heroku-cli-util')
const {Command, api, app} = require('heroku-command')

class Config extends Command {
  async run () {
    const shellescape = require('shell-escape')
    const forEach = require('lodash.foreach')
    const mapKeys = require('lodash.mapkeys')

    let configVars = await this.api.get(`/apps/${this.app}/config-vars`)
    if (this.flags.shell) {
      forEach(configVars, (v, k) => {
        this.log(`${k}=${shellescape([v])}`)
      })
    } else if (this.flags.json) {
      cli.styledJSON(configVars)
    } else {
      cli.styledHeader(`${this.app} Config Vars`)
      cli.styledObject(mapKeys(configVars, (_, k) => cli.color.configVar(k)))
    }
  }
}

Config.topic = 'config'
Config.description = 'display the config vars for an app'
Config.mixins = [api(), app()]
Config.flags = [
  {name: 'shell', char: 's', description: 'output config vars in shell format'},
  {name: 'json', description: 'output config vars in json format'}
]

module.exports = Config
