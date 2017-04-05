'use strict'
/* globals describe it beforeEach */

const cli = require('heroku-cli-util')
const nock = require('nock')
const cmd = require('../../..').commands.find(c => c.topic === 'releases' && c.command === 'output')
const expect = require('chai').expect

describe('releases:output', function () {
  beforeEach(() => cli.mockConsole())

  it('warns if there is no output available', function () {
    process.stdout.columns = 80
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/releases/10')
      .reply(200, { 'version': 40 })
    return cmd.run({app: 'myapp', args: {release: 'v10'}})
      .then(() => expect(cli.stdout).to.equal(''))
      .then(() => expect(cli.stderr).to.equal(' ▸    Release v40 has no release output available.\n'))
      .then(() => api.done())
  })

  it('shows the output from a specific release', function () {
    process.stdout.columns = 80
    let busl = nock('https://busl.test:443')
      .get('/streams/release.log')
      .reply(200, 'Release Output Content')
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/releases/10')
      .reply(200, { 'version': 40, output_stream_url: 'https://busl.test/streams/release.log' })
    return cmd.run({app: 'myapp', args: {release: 'v10'}})
      .then(() => expect(cli.stdout).to.equal('Release Output Content\n'))
      .then(() => expect(cli.stderr).to.equal(''))
      .then(() => busl.done())
      .then(() => api.done())
  })

  it('shows the output from the latest release', function () {
    process.stdout.columns = 80
    let busl = nock('https://busl.test:443')
      .get('/streams/release.log')
      .reply(200, 'Release Output Content')
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/releases')
      .reply(200, [{ 'version': 40, output_stream_url: 'https://busl.test/streams/release.log' }])
    return cmd.run({app: 'myapp', args: {}})
      .then(() => expect(cli.stdout).to.equal('Release Output Content\n'))
      .then(() => expect(cli.stderr).to.equal(''))
      .then(() => busl.done())
      .then(() => api.done())
  })
})
