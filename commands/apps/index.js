'use strict';

let co  = require('co');
let cli = require('heroku-cli-util');
let _   = require('lodash');

function* run (context, heroku) {
  function regionizeAppName (app) {
    if (app.region && app.region.name !== 'us') {
      return `${app.name} (${app.region.name})`;
    } else {
      return app.name;
    }
  }

  let isOrgApp = app => !app.owner.email.endsWith('@herokumanager.com');

  function printJSON (apps) {
    console.log(JSON.stringify(apps, null, 2));
  }

  function print (apps, user) {
    if (apps.length === 0) {
      // TODO: show org/space message
      cli.log('You have no apps.');
      return;
    }
    apps = _.partition(apps, app => app.owner.email === user.email);
    if (apps[0].length > 0) {
      cli.styledHeader('My Apps');
      apps[0].forEach(app => cli.log(regionizeAppName(app)));
      cli.log();
    }

    if (apps[1].length > 0) {
      cli.styledHeader('Collaborated Apps');
      cli.table(apps[1], {
        printHeader: false,
        columns: [
          {key: 'name', get: regionizeAppName},
          {key: 'owner.email'},
        ]
      });
    }
  }

  // TODO: get org from wantsOrg
  let requests = yield {
    apps: heroku.get('/apps'),
    user: heroku.get('/account'),
  };
  let apps = _.sortBy(requests.apps, 'name');
  if (!context.flags.all) apps = apps.filter(isOrgApp);

  if (context.flags.json) {
    printJSON(apps);
  } else {
    print(apps, requests.user);
  }
}

module.exports = {
  topic: '_apps',
  description: 'list your apps',
  help: `
Example:

 $ heroku apps
 === My Apps
 example
 example2

 === Collaborated Apps
 theirapp   other@owner.name`,
  needsAuth: true,
  flags: [
    {name: 'all',  char: 'A', description: 'include apps in all organizations'},
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};

