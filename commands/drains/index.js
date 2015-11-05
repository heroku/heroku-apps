'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run (context, heroku) {
  let drains = yield heroku.request({path: `/apps/${context.app}/log-drains`});
  drains.forEach(function (drain) {
    cli.log(`${drain.url} (${drain.token})`);
  });
}

module.exports = {
  topic: '_drains',
  description: 'display the log drains of an app',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
};
