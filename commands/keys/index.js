'use strict';

let co  = require('co');
let cli = require('heroku-cli-util');

function formatKey (key) {
  key = key.trim().split(/\s/);
  return `${key[0]} ${key[1].substr(0,10)}...${key[1].substr(-10,10)} ${key[2]}`;
}

function* run(context, heroku) {
  let keys = yield heroku.get('/account/keys');
  if (context.flags.json) {
    cli.log(JSON.stringify(keys, null, 2));
  } else if (keys.length === 0) {
    cli.warn('You have no ssh keys.');
  } else if (context.flags.long) {
    keys.forEach(k => cli.log(k.public_key));
  } else {
    keys.map(k => cli.log(formatKey(k.public_key)));
  }
}

module.exports = {
  topic: 'keys',
  description: 'display your ssh keys',
  needsAuth: true,
  run: cli.command(co.wrap(run)),
  flags: [
    {name: 'long', char: 'l', description: 'display full ssh keys'},
    {name: 'json', description: 'output in json format'},
  ],
};
