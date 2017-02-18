'use strict'

const {Command, mixins} = require('heroku-cli-command')

class Config extends mixins.mix(Command).with(mixins.heroku(), mixins.app()) {
  async run () {
    const shellescape = require('shell-escape')
    const forEach = require('lodash.foreach')
    const mapKeys = require('lodash.mapkeys')

    let configVars = await this.heroku.get(`/apps/${this.app}/config-vars`)
    if (this.flags.shell) {
      forEach(configVars, (v, k) => {
        this.log(`${k}=${shellescape([v])}`)
      })
    } else if (this.flags.json) {
      this.styledJSON(configVars)
    } else {
      this.styledHeader(`${this.app} Config Vars`)
      this.styledObject(mapKeys(configVars, (_, k) => this.color.configVar(k)))
    }
  }
}

Config.topic = 'config'
Config.description = 'display the config vars for an app'
Config.flags = [
  {name: 'shell', char: 's', description: 'output config vars in shell format'},
  {name: 'json', description: 'output config vars in json format'}
]

module.exports = Config
