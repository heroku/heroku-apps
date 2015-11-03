'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run (context, heroku) {
  let configVars = yield heroku.request({path: `/apps/${context.app}/config-vars`});
  cli.styledHeader(`${context.app} Config Vars`);
  cli.styledObject(configVars);
}

module.exports = {
  topic: 'config',
  description: 'display the config vars for an app',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
};
