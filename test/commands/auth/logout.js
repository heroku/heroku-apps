'use strict'
/* globals describe beforeEach it */

const cli = require('heroku-cli-util')
const proxyquire = require('proxyquire')

let netrcMock = {}
// get command from index.js
const cmd = proxyquire('../../../commands/auth/logout', {'netrc-parser': netrcMock})[0]
const expect = require('unexpected')

describe('auth:logout', () => {
  beforeEach(() => cli.mockConsole())

  it('logs out the user', () => {
    let saved = false
    netrcMock.save = () => { saved = true }
    netrcMock.machines = {
      'api.heroku.com': { login: 'u', password: 'p' },
      'git.heroku.com': { login: 'u', password: 'p' }
    }
    return cmd.run({})
      .then(() => {
        expect(netrcMock.machines, 'to equal', {})
        expect(cli.stderr, 'to be empty')
        expect(cli.stdout, 'to equal', 'Local credentials cleared\n')
        expect(saved, 'to be true')
      })
  })
})
