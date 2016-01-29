'use strict';

let co  = require('co');
let cli = require('heroku-cli-util');
let _   = require('lodash');

function* run (context, heroku) {
  let org = (!context.flags.personal && !context.flags.all && context.org) ? context.org : null;
  let space = context.flags.space;

  function regionizeAppName (app) {
    if (app.region && app.region.name !== 'us') {
      return `${app.name} (${cli.color.green(app.region.name)})`;
    } else {
      return app.name;
    }
  }

  let isOrgApp = app => !app.owner.email.endsWith('@herokumanager.com');

  function printJSON (apps) {
    console.log(JSON.stringify(apps, null, 2));
  }

  function listApps (apps) {
    apps.forEach(app => cli.log(regionizeAppName(app)));
    cli.log();
  }

  function print (apps, user) {
    if (apps.length === 0) {
      if (space)    cli.log(`${cli.color.green(space)} has no apps.`);
      else if (org) cli.log(`${cli.color.magenta(org)} has no apps.`);
      else          cli.log('You have no apps.');
      return;
    } else if (space) {
      cli.styledHeader(`Apps in space ${cli.color.green(space)}`);
      listApps(apps);
    } else if (org) {
      cli.styledHeader(`Apps in organization ${cli.color.magenta(org)}`);
      listApps(apps);
    } else {
      apps = _.partition(apps, app => app.owner.email === user.email);
      if (apps[0].length > 0) {
        cli.styledHeader('My Apps');
        listApps(apps[0]);
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
  }

  let requests = yield {
    apps: org ? heroku.get(`/organizations/${org}/apps`) : heroku.get('/apps'),
    user: heroku.get('/account'),
  };
  let apps = _.sortBy(requests.apps, 'name');
  if (!context.flags.all && !org && !space) apps = apps.filter(isOrgApp);
  if (space) apps = apps.filter(a => a.space && (a.space.name === space || a.space.id === space));

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
  wantsOrg:  true,
  flags: [
    {name: 'all',  char: 'A', description: 'include apps in all organizations'},
    {name: 'json', description: 'output in json format'},
    {name: 'space', hasValue: true, description: 'filter by space', hidden: true},
    {name: 'personal', char: 'p', description: 'list apps in personal account when a default org is set'},
  ],
  run: cli.command(co.wrap(run))
};

