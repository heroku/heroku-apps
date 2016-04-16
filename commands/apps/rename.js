'use strict';

let co     = require('co');
let cli    = require('heroku-cli-util');
let _      = require('lodash');

function* run (context, heroku) {
  let git = require('../../lib/git')(context);

  let oldApp = context.flags.from || context.app;
  let newApp = context.flags.to || context.args.newname;

  let request = heroku.request({
    method: 'PATCH',
    path:   `/apps/${oldApp}`,
    body:   {name: newApp},
  });
  let app = yield cli.action(`Renaming ${cli.color.app(oldApp)} to ${cli.color.app(newApp)}`, request);
  let gitUrl = context.flags['ssh-git'] ? git.sshGitHurl(app.name) : git.gitUrl(app.name);
  cli.log(`${cli.color.cyan(app.web_url)} | ${cli.color.green(gitUrl)}`);

  if (git.inGitRepo()) {
    // delete git remotes pointing to this app
    yield _(yield git.listRemotes())
    .filter(r => git.gitUrl(oldApp) === r[1] || git.sshGitUrl(oldApp) === r[1])
    .map(r => r[0])
    .uniq()
    .map(r => {
      return git.rmRemote(r)
      .then(() => git.createRemote(r, gitUrl))
      .then(() => cli.log(`Git remote ${r} updated`));
    }).value();
  }

  cli.warn("Don't forget to update git remotes for all other local checkouts of the app.");
}

let cmd = {
  topic: 'apps',
  command: 'rename',
  description: 'rename an app',
  help: `
This will locally update the git remote if it is set to the old app.

Example:

  $ heroku apps:rename --from oldname --to newname
  https://newname.herokuapp.com/ | https://git.heroku.com/newname.git
  Git remote heroku updated
  `,
  needsAuth: true,
  wantsApp:  true,
  args:  [{name: 'newname', hidden: true, optional: true}],
  flags: [
    {name: 'ssh-git', description: 'use ssh git protocol instead of https'},
    {name: 'from', description: 'current app name', hasValue: true},
    {name: 'to', description: 'new app name', hasValue: true},
  ],
  run: cli.command(co.wrap(run))
};

module.exports.apps = cmd;
module.exports.root = Object.assign({}, cmd, {topic: 'rename', command: null});
