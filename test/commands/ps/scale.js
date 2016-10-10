'use strict'
/* globals describe beforeEach it afterEach commands */

const cli = require('heroku-cli-util')
const nock = require('nock')
const cmd = commands.find((c) => c.topic === 'ps' && c.command === 'scale')
const expect = require('unexpected')

describe('ps:scale', () => {
  let api, metrics

  beforeEach(() => {
    cli.mockConsole()
    api = nock('https://api.heroku.com')
    metrics = nock('https://api.metrics.heroku.com')
  })

  afterEach(() => {
    api.done()
    metrics.done()
    nock.cleanAll()
  })

  it('shows formation with no args', () => {
    api
      .get('/apps/myapp/formation')
      .reply(200, [{type: 'web', quantity: 1, size: 'Free'}, {type: 'worker', quantity: 2, size: 'Free'}])

    return cmd.run({app: 'myapp', args: []})
      .then(() => expect(cli.stdout, 'to equal', 'web=1:Free worker=2:Free\n'))
      .then(() => expect(cli.stderr, 'to be empty'))
  })

  it('errors with no process types', () => {
    api
      .get('/apps/myapp/formation')
      .reply(200, [])

    return expect(cmd.run({app: 'myapp', args: []}),
      'to be rejected with', {message: /^No process types on myapp./})
      .then(() => expect(cli.stdout, 'to be empty'))
      .then(() => expect(cli.stderr, 'to be empty'))
  })

  it('scales web=1 worker=2', () => {
    api
      .get('/apps/myapp').reply(200, {id: 100})
      .patch('/apps/myapp/formation', {updates: [{type: 'web', quantity: '1'}, {type: 'worker', quantity: '2'}]})
      .reply(200, [{type: 'web', quantity: 1, size: 'Free'}, {type: 'worker', quantity: 2, size: 'Free'}])
    metrics
      .get('/apps/100/formation/web/monitors')
      .reply(200, [{name: 'LATENCY', action_type: 'scale', is_active: true}])

    return cmd.run({app: 'myapp', args: ['web=1', 'worker=2'], flags: {confirm: 'myapp'}})
      .then(() => expect(cli.stdout, 'to be empty'))
      .then(() => expect(cli.stderr, 'to equal', 'Scaling dynos... done, now running web at 1:Free, worker at 2:Free\n'))
  })

  it('scales worker+1', () => {
    api
      .patch('/apps/myapp/formation', {updates: [{type: 'worker', quantity: '+1'}]})
      .reply(200, [{type: 'worker', quantity: 2, size: 'Free'}])

    return cmd.run({app: 'myapp', args: ['worker+1']})
      .then(() => expect(cli.stdout, 'to be empty'))
      .then(() => expect(cli.stderr, 'to equal', 'Scaling dynos... done, now running worker at 2:Free\n'))
  })

  it('continues if autoscale check fails', () => {
    api
      .get('/apps/myapp').reply(200, {id: 100})
      .patch('/apps/myapp/formation', {updates: [{type: 'web', quantity: '1'}, {type: 'worker', quantity: '2'}]})
      .reply(200, [{type: 'web', quantity: 1, size: 'Free'}, {type: 'worker', quantity: 2, size: 'Free'}])
    metrics.get('/apps/100/formation/web/monitors').reply(500)

    return cmd.run({app: 'myapp', args: ['web=1', 'worker=2'], flags: {confirm: 'myapp'}})
      .then(() => expect(cli.stdout, 'to be empty'))
      .then(() => expect(cli.stderr, 'to equal', 'Scaling dynos... done, now running web at 1:Free, worker at 2:Free\n'))
  })
})
