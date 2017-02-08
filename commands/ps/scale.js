'use strict'

const {Command, mixins} = require('heroku-cli-command')

class Scale extends Command {
  async run () {
    const compact = require('lodash.compact')
    let app = this.app

    function parse (args) {
      return compact(args.map((arg) => {
        let change = arg.match(/^([a-zA-Z0-9_]+)([=+-]\d+)(?::([\w-]+))?$/)
        if (!change) return
        let quantity = change[2][0] === '=' ? change[2].substr(1) : change[2]
        return {type: change[1], quantity, size: change[3]}
      }))
    }

    let changes = parse(this.args)
    if (changes.length === 0) {
      let formation = await this.api.get(`/apps/${app}/formation`)
      if (formation.length === 0) throw this.emptyFormationErr(app)
      this.log(formation.map((d) => `${d.type}=${d.quantity}:${d.size}`).sort().join(' '))
    } else {
      let scaling = async function () {
        let formation = await this.api.request({method: 'PATCH', path: `/apps/${app}/formation`, body: {updates: changes}})
        let output = formation.filter((f) => changes.find((c) => c.type === f.type))
          .map((d) => `${this.color.green(d.type)} at ${d.quantity}:${d.size}`)
        this.action.done(`done, now running ${output.join(', ')}`)
      }
      await this.action('Scaling dynos', {success: false}, scaling.call(this))
    }
  }

  emptyFormationErr (app) {
    return new Error(`No process types on ${this.color.app(app)}.
Upload a Procfile to add process types.
https://devcenter.heroku.com/articles/procfile`)
  }

}

Scale.topic = 'ps'
Scale.command = 'scale'
Scale.description = 'scale dyno quantity up or down'
Scale.variableArgs = true
Scale.aliases = ['ps:scale', 'dyno:scale', 'scale']
Scale.help = `Appending a size (eg. web=2:Standard-2X) allows simultaneous scaling and resizing.

Omitting any arguments will display the app's current dyno formation, in a
format suitable for passing back into ps:scale.

Examples:

  $ heroku ps:scale web=3:Standard-2X worker+1
  Scaling dynos... done, now running web at 3:Standard-2X, worker at 1:Standard-1X.

  $ heroku ps:scale
  web=3:Standard-2X worker=1:Standard-1X
`

mixins.api(Scale)
mixins.app(Scale)
module.exports = Scale
