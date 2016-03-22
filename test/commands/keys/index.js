'use strict';

let cmd = commands.find(c => c.topic === 'keys' && !c.command);

describe('heroku keys', () => {
  beforeEach(() => cli.mockConsole());
  afterEach(() => nock.cleanAll());

  it('shows ssh keys', () => {
    let api = nock('https://api.heroku.com:443')
      .get('/account/keys')
      .reply(200, [
        {email: 'user@example.com', public_key: 'ssh-rsa AAAAB3NzxCXXXXXXXXXXXXXXXXXXXV7iHuYrZxd user@machine'}
      ]);
    return cmd.run({flags: {}})
    .then(() => expect(`=== user@example.com keys
ssh-rsa AAAAB3NzxC...V7iHuYrZxd user@machine\n`).to.equal(cli.stdout))
    .then(() => expect('').to.equal(cli.stderr))
    .then(() => api.done());
  });
});
