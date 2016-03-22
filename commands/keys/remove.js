'use strict';

let co  = require('co');
let cli = require('heroku-cli-util');

function* run(context, heroku) {
  yield cli.action(`Removing ${cli.color.cyan(context.args.key)} ssh key`, co(function* () {
    let keys = yield heroku.get('/account/keys');
    if (keys.length === 0) throw new Error('No ssh keys on account');
    let key = keys.find(k => k.comment === context.args.key);
    if (!key) throw new Error(`SSH Key ${cli.color.red(context.args.key)} not found.\nFound keys: ${cli.color.yellow(keys.map(k => k.comment).join(', '))}.`);
    yield heroku.request({
      method: 'DELETE',
      path:   `/account/keys/${key.id}`,
    });
  }));
}

module.exports = {
  topic: 'keys',
  command: 'remove',
  description: 'remove an ssh key from the user',
  help: `
Example:

  $ heroku keys:remove email@example.com
  Removing email@example.com SSH key... done
  `,
  needsAuth: true,
  args: [{name: 'key'}],
  run: cli.command(co.wrap(run))
};
