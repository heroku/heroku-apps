'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  function getRelease (id) {
    return heroku.get(`/apps/${context.app}/releases/${id}`)
  }

  function getLatestRelease () {
    return heroku.request({
      path: `/apps/${context.app}/releases`,
      partial: true,
      headers: { 'Range': 'version ..; max=1, order=desc' }
    }).then((releases) => releases[0])
  }

  let release
  if (context.args.release) {
    let id = context.args.release.toLowerCase()
    id = id.startsWith('v') ? id.slice(1) : id
    release = yield getRelease(id)
  } else {
    release = yield getLatestRelease()
  }
  let streamUrl = release.output_stream_url

  if (!streamUrl) {
    cli.warn(`Release v${release.version} has no release output available.`)
    return
  }

  yield new Promise(function (resolve, reject) {
    cli.got.stream(streamUrl)
      .on('error', reject)
      .on('end', resolve)
      .on('data', function (c) {
        cli.log(c.toString('utf8'))
      })
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
