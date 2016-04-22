'use strict'
/* globals describe beforeEach it */

const cli = require('heroku-cli-util')
const nock = require('nock')
const cmd = require('../../../commands/domains')
const expect = require('chai').expect

describe('domains', function () {
  beforeEach(() => cli.mockConsole())

  it('shows the domains', function () {
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/domains')
      .reply(200, [
        {'cname': 'myapp.com', 'hostname': 'myapp.com', 'kind': 'custom'},
        {'cname': null, 'hostname': 'myapp.herokuapp.com', 'kind': 'heroku'}
      ])
    return cmd.run({app: 'myapp', flags: {}})
      .then(() => expect(cli.stdout).to.equal(`=== myapp Heroku Domain
myapp.herokuapp.com

=== myapp Custom Domains
Domain Name  DNS Target
───────────  ──────────
myapp.com    myapp.com
`))
      .then(() => api.done())
  })
})
