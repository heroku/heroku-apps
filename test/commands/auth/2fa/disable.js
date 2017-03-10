'use strict'
/* globals commands, describe beforeEach afterEach it */

const cli = require('heroku-cli-util')
const nock = require('nock')

// get command from index.js
const cmd = commands.find(c => c.topic === 'auth' && c.command === '2fa:disable')
const expect = require('unexpected')

describe('auth:2fa:disable', () => {
  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  it('disables 2fa on account', () => {
    cli.prompt = function () { return Promise.resolve('foobar') }

    let api = nock('https://api.heroku.com')
      .patch('/account', {password: 'foobar', two_factor_authentication: false})
      .reply(200, {two_factor_authentication: false})

    return cmd.run({})
      .then(() => expect(cli.stdout, 'to equal', 'Two-factor authentication has been disabled\n'))
      .then(() => expect(cli.stderr, 'to be empty'))
      .then(() => api.done())
  })
})
