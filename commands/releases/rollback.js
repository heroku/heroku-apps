'use strict'

let cli = require('heroku-cli-util')
let co = require('co')
let releases = require('../../lib/releases')

function * run (context, heroku) {
  let release
  if (context.args.release) {
    let id = context.args.release.toLowerCase()
    id = id.startsWith('v') ? id.slice(1) : id
    release = yield heroku.get(`/apps/${context.app}/releases/${id}`)
  } else {
    release = yield releases.FindRelease(heroku, context.app, (releases) => releases.filter((r) => r.status === 'succeeded')[1])
  }

  let latest
  yield cli.action(`Rolling back ${cli.color.app(context.app)} to ${cli.color.green('v' + release.version)}`, {success: false}, co(function * () {
    latest = yield heroku.post(`/apps/${context.app}/releases`, {body: {release: release.id}})

    cli.action.done(`done, ${cli.color.green('v' + latest.version)}`)
    cli.warn(`Rollback affects code and config vars; it doesn't add or remove addons.
To undo, run: ${cli.color.cmd('heroku rollback v' + (latest.version - 1))}`)
  }))

  if (latest.output_stream_url) {
    cli.log('Running release command...')
    yield new Promise(function (resolve, reject) {
      let stream = cli.got.stream(release.output_stream_url)
      stream.on('error', reject)
      stream.on('end', resolve)
      let piped = stream.pipe(process.stdout)
      piped.on('error', reject)
    })
  }
}

let cmd = {
  description: 'rollback to a previous release',
  help: 'If RELEASE is not specified, it will rollback one release',
  needsApp: true,
  needsAuth: true,
  args: [{name: 'release', optional: true}],
  run: cli.command({preauth: true}, co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'releases', command: 'rollback'}, cmd),
  Object.assign({hidden: true, topic: 'rollback'}, cmd)
]
