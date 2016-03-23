'use strict';

let co   = require('co');
let cli  = require('heroku-cli-util');

let colorize = (level, s) => {
  switch (level) {
    case 'critical': return cli.color.red(s);
    case 'warning':  return cli.color.yellow(s);
    case 'info':     return cli.color.cyan(s);
    default:         return s;
  }
};

function* run (context, heroku) {
  let resp = yield heroku.request({host: 'longboard.heroku.com', path: `/metrics/${context.app}/web`, headers: {Range: ''}});
  let errors = resp.data.errorsV2;

  if (context.flags.json) {
    cli.styledJSON(errors);
  } else {
    cli.table(errors, {
      columns: [
        {key: 'name',   format: (name, row) => colorize(row.level, name)},
        {key: 'level',  format: level => colorize(level, level)},
        {key: 'title',  label: 'desc'},
        {key: 'points', label: 'count', format: v => v.length.toString()},
      ]
    });
  }
}

module.exports = {
  topic:   'apps',
  command: 'errors',
  description: 'view app errors',
  needsAuth: true,
  needsApp:  true,
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};
