'use strict';

let cli      = require('heroku-cli-util');
let co       = require('co');

function* run (context, heroku) {
  let app  = context.app;
  let dyno = context.args.dyno;

  let msg = 'Restarting';
  if (dyno) msg += ` ${cli.color.cyan(dyno)}`;
  msg += (dyno && dyno.indexOf('.') !== -1) ? ' dyno' : ' dynos';

  yield cli.action(msg, co(function* () {
    yield heroku.delete(dyno ? `/apps/${app}/dynos/${encodeURIComponent(dyno)}` : `/apps/${app}/dynos`);
  }));
}

let cmd = {
  topic:   'ps',
  command: 'restart',
  description: 'restart app dynos',
  help: `
if DYNO is not specified, restarts all dynos on app

Examples:

  $ heroku ps:restart web.1
  Restarting web.1 dyno... done

  $ heroku ps:restart web
  Restarting web dynos... done

  $ heroku ps:restart
  Restarting dynos... done
`,
  needsAuth: true,
  needsApp: true,
  args: [{name: 'dyno', optional: true}],
  run: cli.command(co.wrap(run))
};

exports.root     = cmd;
exports.ps       = Object.assign({}, cmd, {topic: 'restart', command: null});
exports.dyno     = Object.assign({}, cmd, {topic: 'dyno',    command: 'restart'});
exports.stop     = Object.assign({}, cmd, {topic: 'ps',      command: 'stop'});
exports.stopDyno = Object.assign({}, cmd, {topic: 'dyno',    command: 'stop'});
exports.stopRoot = Object.assign({}, cmd, {topic: 'stop',    command: null});
exports.kill     = Object.assign({}, cmd, {topic: 'ps',      command: 'kill'});
exports.killDyno = Object.assign({}, cmd, {topic: 'dyno',    command: 'kill'});
exports.killRoot = Object.assign({}, cmd, {topic: 'kill',    command: null});
