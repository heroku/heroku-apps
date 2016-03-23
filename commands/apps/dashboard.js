'use strict';

let co   = require('co');
let cli  = require('heroku-cli-util');
let time = require('../../lib/time');
let _    = require('lodash');

let plural   = (s, n) => n === 1 ? s : s + 's';

function displayFormation (formation) {
  formation = _.groupBy(formation, 'size');
  formation = _.map(formation, (p, size) => `${cli.color.yellow(_.sumBy(p, 'quantity'))}:${cli.color.cyan(size)}`);
  cli.log(`    Dynos: ${formation.join(' ')}`);
}

function displayErrors (metrics) {
  let routerErrors = metrics.routerErrors.points;
  let dynoErrors   = metrics.dynoErrors.points;
  let count = 0;
  if (routerErrors.length > 0) count += routerErrors[0].sum;
  if (dynoErrors.length > 0)   count += dynoErrors[0].sum;
  if (count > 0) {
    cli.log(`    ${cli.color.red(count + plural(' error', count))} - see details with ${cli.color.yellow('heroku apps:errors')}`);
  }
}

function displayMetrics (metrics) {
  let ms  = metrics.responseTimeDay.points[0].service_50;
  let rpm = Math.round(metrics.throughputDay.points[0].count/1440);
  cli.log(`    ${cli.color.green(_.pad(ms+' ms', 6))} ${cli.color.yellow(rpm+' rpm')}`);
  displayErrors(metrics);
}

function* run (context, heroku) {
  function favoriteApps () {
    return heroku.request({
      host: 'longboard.heroku.com',
      path: '/favorites',
      headers: {Range: ''},
    }).then(apps => apps.map(app => app.app_name));
  }
  let apps = yield favoriteApps();
  let owner = owner => owner.email.endsWith('@herokumanager.com') ? owner.email.split('@')[0] : owner.email;

  let data = yield {
    account: heroku.get('/account'),
    orgs:    heroku.get('/organizations'),
    apps:    apps.map(app => ({
      app:       heroku.get(`/apps/${app}`),
      formation: heroku.get(`/apps/${app}/formation`),
      pipeline:  heroku.get(`/apps/${app}/pipeline-couplings`).catch(() => null),
      metrics:   heroku.request({host: 'longboard.heroku.com', path: `/metrics/${app}/summary`, headers: {Range: ''}}).catch(() => null),
    })),
  };
  cli.styledHeader(`${cli.color.green(data.account.email)} apps`);
  let maxNameLength = _.maxBy(data.apps, 'app.name.length').app.name.length;
  for (let app of data.apps) {
    let pipeline = app.pipeline ? ` pipeline: ${cli.color.blue(app.pipeline.pipeline.name)}`: ``;
    cli.log(`${cli.color.bold(_.padEnd(app.app.name, maxNameLength))} ${cli.color.blue(owner(app.app.owner))}${pipeline}`);
    displayFormation(app.formation);
    cli.log(`    Last release: ${cli.color.green(time.ago(new Date(app.app.released_at)))}`);
    if (app.metrics) displayMetrics(app.metrics.data);
    cli.log();
  }
  cli.log(`See all add-ons with ${cli.color.cyan('heroku addons')}`);
  let sampleOrg = _.sortBy(data.orgs, o => new Date(o.created_at))[0];
  if (sampleOrg) cli.log(`See all apps in ${cli.color.blue(sampleOrg.name)} with ${cli.color.cyan('heroku apps --org ' + sampleOrg.name)}`);
  cli.log(`See all apps with ${cli.color.cyan('heroku apps --all')}`);
}

module.exports = {
  topic: 'apps',
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
