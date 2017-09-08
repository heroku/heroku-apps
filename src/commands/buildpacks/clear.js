'use strict'

let co = require('co')
let cli = require('heroku-cli-util')

let BuildpackCommand = require('../../buildpacks.js')

function * run (context, heroku) {
  yield new BuildpackCommand(context, heroku, 'clear', 'cleared').clear()
}

module.exports = {
  topic: 'buildpacks',
  command: 'clear',
  description: 'clear all buildpacks set on the app',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run)),
  help: `Example:

    $ heroku buildpacks:clear --app murmuring-headland-14719
    Buildpacks cleared. Next release on murmuring-headland-14719 will detect buildpack normally.`
}
