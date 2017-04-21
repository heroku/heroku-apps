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
    release = yield releases.FindRelease(heroku, context.app, (releases) => releases[0])
  }
  let streamUrl = release.output_stream_url

  if (!streamUrl) {
    cli.warn(`Release v${release.version} has no release output available.`)
    return
  }

  yield new Promise(function (resolve, reject) {
    let stream = cli.got.stream(streamUrl)
    stream.on('error', reject)
    stream.on('end', resolve)
    let piped = stream.pipe(process.stdout)
    piped.on('error', reject)
  })
}

module.exports = {
  topic: 'releases',
  command: 'output',
  description: 'View the release command output',
  needsAuth: true,
  needsApp: true,
  args: [{name: 'release', optional: true}],
  run: cli.command({preauth: true}, co.wrap(run))
}
