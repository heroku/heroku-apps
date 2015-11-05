'use strict';

let cli         = require('heroku-cli-util');
let shellescape = require('shell-escape');
let co          = require('co');

function* run (context, heroku) {
  let configVars = yield heroku.request({path: `/apps/${context.app}/config-vars`});
  if (context.flags.shell) {
    let v = configVars[context.args.key];
    if (v) {
      v = process.stdout.isTTY ? shellescape([v]) : v;
      cli.log(`${context.args.key}=${v}`);
    } else {
      cli.log();
    }
  } else {
    let v = configVars[context.args.key];
    if (v) cli.log(configVars[context.args.key]);
    else   cli.log();
  }
}

module.exports = {
  topic: 'config',
  command: 'get',
  description: 'display a config value for an app',
  help: `Example:

 $ heroku config:get RAILS_ENV
 production
 `,
  args:  [{name: 'key'}],
  flags: [{name: 'shell', char: 's', description: 'output config var in shell format'}],
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
};
