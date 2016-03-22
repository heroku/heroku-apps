'use strict';

let cmd = commands.find(c => c.topic === 'ps' && c.command === 'type');

describe('ps:type', function() {
  beforeEach(function() {
    cli.mockConsole();
    nock.cleanAll();
  });

  it('switches to hobby dynos', function() {
    let api = nock('https://api.heroku.com')
    .get('/apps/myapp/formation')
    .reply(200, [{type: 'web', quantity: 1, size: 'Free'}, {type: 'worker', quantity: 2, size: 'Free'}])
    .patch('/apps/myapp/formation', {updates: [{type: 'web', size: 'hobby'}, {type: 'worker', size: 'hobby'}]})
    .reply(200, [{type: 'web', quantity: 1, size: 'Hobby'}, {type: 'worker', quantity: 2, size: 'Hobby'}])
    .get('/apps/myapp/formation')
    .reply(200, [{type: 'web', quantity: 1, size: 'Hobby'}, {type: 'worker', quantity: 2, size: 'Hobby'}]);

    return cmd.run({app: 'myapp', args: ['hobby']})
    .then(() => expect(cli.stdout).to.eq(`dyno    type   qty  cost/mo
──────  ─────  ───  ───────
web     Hobby  1    7
worker  Hobby  2    14\n`))
    .then(() => expect(cli.stderr).to.eq('Scaling dynos... done, now running web at 1:Hobby, worker at 2:Hobby\n'))
    .then(() => api.done());
  });

  it.only('switches to standard-1x and standard-2x dynos', function() {
    let api = nock('https://api.heroku.com')
    .get('/apps/myapp/formation')
    .reply(200, [{type: 'web', quantity: 1, size: 'Free'}, {type: 'worker', quantity: 2, size: 'Free'}])
    .patch('/apps/myapp/formation', {updates: [{type: 'web', size: 'standard-1x'}, {type: 'worker', size: 'standard-2x'}]})
    .reply(200, [{type: 'web', quantity: 1, size: 'Standard-1X'}, {type: 'worker', quantity: 2, size: 'Standard-2X'}])
    .get('/apps/myapp/formation')
    .reply(200, [{type: 'web', quantity: 1, size: 'Standard-1X'}, {type: 'worker', quantity: 2, size: 'Standard-2X'}]);

    return cmd.run({app: 'myapp', args: ['web=standard-1x', 'worker=standard-2x']})
    .then(() => expect(cli.stdout).to.eq(`dyno    type         qty  cost/mo
──────  ───────────  ───  ───────
web     Standard-1X  1    25
worker  Standard-2X  2    100\n`))
    .then(() => expect(cli.stderr).to.eq('Scaling dynos... done, now running web at 1:Standard-1X, worker at 2:Standard-2X\n'))
    .then(() => api.done());
  });
});
