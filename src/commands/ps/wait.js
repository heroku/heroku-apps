'use strict'

let cli = require('heroku-cli-util')
let co = require('co')
let waitForDynos = require('../../ps_wait')

function * run (context, heroku) {
  yield waitForDynos(context, heroku)
}

let cmd = {
  description: 'wait for a release to cycle in',
  help: `
When a release is created, it may take a while for all dynos to be
running the new version. This is especially true for applications in
Heroku Private Spaces or using the common runtime preboot feature,
where dynos cycle in gradually when a new release is deployed. This
command allows you to wait until all dynos are on the latest release
version.

Examples:

    $ heroku ps:wait
    Waiting for every dyno to be running v12... 0 / 8, done

    $ heroku ps:wait -t web
    Waiting for every web dyno to be running v12... 0 / 2, done
`,
  needsAuth: true,
  needsApp: true,
  args: [{name: 'dyno', optional: true}],
  flags: [
    { name: 'wait-interval', char: 'w', description: 'how frequently to poll in seconds (to avoid rate limiting)', hasValue: true },
    { name: 'with-run', char: 'R', description: 'whether to wait for one-off run dynos', hasValue: false },
    { name: 'type', char: 't', description: 'wait for one specific dyno type', hasValue: true }
  ],
  run: cli.command(co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'ps', command: 'wait'}, cmd)
]
