'use strict';

let nock   = require('nock');
let expect = require('chai').expect;
let apps   = require('../../../commands/apps/index.js');

let example = {
  name: 'example',
  owner: {email: 'foo@bar.com'}
};

let orgApp1 = {
  name: 'org-app-1',
  owner: {email: 'test-org@herokumanager.com'}
};

let orgApp2 = {
  name: 'org-app-2',
  owner: {email: 'test-org@herokumanager.com'}
};

let orgSpaceApp1 = {
  name: 'space-app-1',
  owner: {email: 'test-org@herokumanager.com'},
  space: {id: 'test-space-id', name: 'test-space'}
};

let orgSpaceApp2 = {
  name: 'space-app-2',
  owner: {email: 'test-org@herokumanager.com'},
  space: {id: 'test-space-id', name: 'test-space'}
};

function stubApps(apps) {
  return nock('https://api.heroku.com')
  .get('/apps')
  .reply(200, apps);
}

function stubOrgApps(org, apps) {
  return nock('https://api.heroku.com')
  .get(`/organizations/${org}/apps`)
  .reply(200, apps);
}

describe('heroku apps:list', function() {
  beforeEach(function() {
    cli.mockConsole();
    nock.cleanAll();

    nock('https://api.heroku.com')
    .get('/account')
    .reply(200, {email: 'foo@bar.com'});
  });

  describe("with no args", function() {
    it("displays a message when the user has no apps", function() {
      let mock = stubApps([]);
      return apps.run({flags: {}, args: {}}).
      then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal('You have no apps.\n');
      });
    });

    it("list all user apps omitting org apps", function() {
      let mock = stubApps([example, orgApp1]);
      return apps.run({flags: {}, args: {}}).
      then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`=== My Apps
example

`);
      });
    });
  });

  describe("with org", function() {
    it("displays a message when the org has no apps", function() {
      let mock = stubOrgApps('test-org', []);
      return apps.run({org: 'test-org', flags: {}, args: {}}).
      then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(`There are no apps in organization test-org.\n`);
      });
    });

    it("list all in an organization", function() {
      let mock = stubOrgApps('test-org', [orgApp1, orgApp2]);
      return apps.run({org: 'test-org', flags: {}, args: {}}).
      then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`=== Apps in organization test-org
org-app-1
org-app-2

`);
      });
    });
  });

  describe("with space", function() {
    beforeEach(function() {
      return nock('https://api.heroku.com')
      .get(`/spaces/test-space`)
      .reply(200, {organization: {name: 'test-org'}});
    });

    it("displays a message when the space has no apps", function() {
      let mock = stubOrgApps('test-org', []);
      return apps.run({flags: {space: 'test-space'}, args: {}}).
      then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(`There are no apps in space test-space.\n`);
      });
    });

    it("lists only apps in spaces by name", function() {
      let mock = stubOrgApps('test-org', [orgSpaceApp1, orgSpaceApp2, orgApp1]);
      return apps.run({flags: {space: 'test-space'}, args: {}}).
      then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`=== Apps in space test-space
space-app-1
space-app-2

`
);
      });
    });
  });
});
