'use strict'

let co = require('co')
let cli = require('heroku-cli-util')
let BuildpackCommand = require('../../buildpacks.js')

function * run (context, heroku) {
  let buildpacksCommand = new BuildpackCommand(context, heroku)

  let buildpacks = yield buildpacksCommand.get()
  if (buildpacks.length === 0) {
    cli.log(`${context.app} has no Buildpack URL set.`)
  } else {
    cli.styledHeader(`${context.app} Buildpack URL${buildpacks.length > 1 ? 's' : ''}`)
    buildpacksCommand.display(buildpacks, '')
  }
}

module.exports = {
  topic: 'buildpacks',
  overview: `Buildpacks are responsible for transforming deployed code into a slug, which can then be executed on a dyno. Buildpacks are composed of a set of scripts, and depending on the programming language, the scripts will retrieve dependencies, output generated assets or compiled code, and more. This output is assembled into a slug by the slug compiler.
  Heroku’s support for Ruby, Python, Java, Clojure, Node.js, Scala, Go and PHP is implemented via a set of open source buildpacks`,
  description: 'display the buildpack_url(s) for an app',
  help: `Examples:

    $ heroku buildpacks
`,
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
}
