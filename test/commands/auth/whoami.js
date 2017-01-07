'use strict'
/* globals commands, describe beforeEach afterEach it */

const cli = require('heroku-cli-util')
const nock = require('nock')

// get command from index.js
const cmd = commands.find(c => c.topic === 'auth' && c.command === 'whoami')
const expect = require('unexpected')

describe('auth:whoami', () => {
  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  it('shows logged in user', () => {
    let api = nock('https://api.heroku.com:443')
      .get('/account')
      .reply(200, {email: 'foo@bar.com'})

    return cmd.run({auth: {password: 'foobar'}})
      .then(() => expect(cli.stdout, 'to equal', 'foo@bar.com\n'))
      .then(() => expect(cli.stderr, 'to be empty'))
      .then(() => api.done())
  })
})
