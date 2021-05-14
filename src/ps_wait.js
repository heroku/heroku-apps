'use strict'

const cli = require('heroku-cli-util')

module.exports = function * (context, heroku, delay) {
  const wait = require('co-wait')

  if (context.flags['with-run'] && context.flags['type']) {
    cli.exit(1, 'Cannot specify both --type and --with-run')
  }

  let releases = yield heroku.request({
    path: `/apps/${context.app}/releases`,
    partial: true,
    headers: {
      'Range': 'version ..; max=1, order=desc'
    }
  })

  if (releases.length === 0) {
    cli.exit(1, `App ${context.app} has no releases`)
  }

  const latestRelease = releases[0]
  let released = true
  let interval = parseFloat(context.flags['wait-interval'])
  if (!interval || interval < 0) {
    interval = 10
  }

  if (delay) {
    yield wait(delay)
  }

  while (true) {
    let dynos = yield heroku.get(`/apps/${context.app}/dynos`)
    dynos = dynos.filter((dyno) => dyno.type !== 'release')
      .filter((dyno) => context.flags['with-run'] || dyno.type !== 'run')
      .filter((dyno) => !context.flags.type || dyno.type === context.flags.type)

    let onLatest = dynos.filter((dyno) => {
      return dyno.state === 'up' && dyno.release.id === latestRelease.id
    })
    if (onLatest.length === dynos.length) {
      if (!released) {
        cli.action.done(`${onLatest.length} / ${dynos.length}, done`)
      }
      return
    }

    if (released) {
      released = false
      if (context.flags.type) {
        cli.action.start(`Waiting for every ${context.flags.type} dyno to be running v${latestRelease.version}`)
      } else {
        cli.action.start(`Waiting for every dyno to be running v${latestRelease.version}`)
      }
    }

    cli.action.status(`${onLatest.length} / ${dynos.length}`)

    yield wait(interval * 1000)
  }
}
