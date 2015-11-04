'use strict';

let expect     = require('chai').expect;
let buildpacks = require('../../../commands/buildpacks/add.js');
let error      = require('../../../lib/error.js');
let stub_get   = require('../../stubs/buildpacks.js').get;
let stub_put   = require('../../stubs/buildpacks.js').put;
let assert_exit = require('../../assert_exit.js');

describe('heroku buildpacks:add', function() {
  beforeEach(function() {
    cli.mockConsole();
    error.exit.mock();
  });

  describe('URL', function() {
    it('# with no buildpacks adds the buildpack URL', function() {
      stub_get();

      let mock = stub_put('https://github.com/heroku/heroku-buildpack-ruby');

      return buildpacks.run({
        app: 'example', args: {url: 'https://github.com/heroku/heroku-buildpack-ruby'}
      }).then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`Buildpack added. Next release on example will use https://github.com/heroku/heroku-buildpack-ruby.
Run git push heroku master to create a new release using this buildpack.
`);
      });
    });

    it('# with one existing buildpack adds a buildpack URL to the end of the list', function() {
      stub_get('https://github.com/heroku/heroku-buildpack-java');

      let mock = stub_put(
        'https://github.com/heroku/heroku-buildpack-java',
        'https://github.com/heroku/heroku-buildpack-ruby' 
      );

      return buildpacks.run({
        app: 'example', args: {url: 'https://github.com/heroku/heroku-buildpack-ruby'}
      }).then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`Buildpack added. Next release on example will use:
  1. https://github.com/heroku/heroku-buildpack-java
  2. https://github.com/heroku/heroku-buildpack-ruby
Run git push heroku master to create a new release using these buildpacks.
`);
      });
    });

    it('# with two existing buildpacks successfully adds a buildpack URL to the end of the list', function() {
      stub_get(
        "https://github.com/heroku/heroku-buildpack-java", 
        "https://github.com/heroku/heroku-buildpack-nodejs"
      );

      let mock = stub_put(
        'https://github.com/heroku/heroku-buildpack-java',
        'https://github.com/heroku/heroku-buildpack-nodejs',
        'https://github.com/heroku/heroku-buildpack-ruby'
      );

      return buildpacks.run({
        app: 'example', args: {url: 'https://github.com/heroku/heroku-buildpack-ruby'}
      }).then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`Buildpack added. Next release on example will use:
  1. https://github.com/heroku/heroku-buildpack-java
  2. https://github.com/heroku/heroku-buildpack-nodejs
  3. https://github.com/heroku/heroku-buildpack-ruby
Run git push heroku master to create a new release using these buildpacks.
`);
      });
    });

    it('# with no buildpacks handles a missing buildpack URL arg', function() {
      return assert_exit(1, buildpacks.run({
        app: 'example', args: {}
      })).then(function() {
        expect(cli.stdout).to.equal('');
        expect(cli.stderr).to.equal(
` ▸    Usage: heroku buildpacks:add BUILDPACK_URL.
 ▸    Must specify target buildpack URL.
`);
      });
    });

    it('# errors out when already exists', function() {
      stub_get('http://github.com/foobar/foobar');

      return assert_exit(1, buildpacks.run({
        app: 'example', args: {url: 'http://github.com/foobar/foobar'},
      })).then(function() {
        expect(cli.stderr).to.equal(' ▸    The buildpack http://github.com/foobar/foobar is already set on your app.\n');
      });
    });
  });

  describe('-i INDEX URL', function() {
    it('# with no buildpacks adds the buildpack URL with index', function() {
      stub_get();

      let mock = stub_put('https://github.com/heroku/heroku-buildpack-ruby');

      return buildpacks.run({
        app: 'example', args: {url: 'https://github.com/heroku/heroku-buildpack-ruby'},
        flags: {index: '1'},
      }).then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`Buildpack added. Next release on example will use https://github.com/heroku/heroku-buildpack-ruby.
Run git push heroku master to create a new release using this buildpack.
`);
      });
    });

    it('# with one existing buildpack inserts a buildpack URL at index', function() {
      stub_get('https://github.com/heroku/heroku-buildpack-java');

      let mock = stub_put(
        'https://github.com/heroku/heroku-buildpack-ruby', 
        'https://github.com/heroku/heroku-buildpack-java'
      );

      return buildpacks.run({
        app: 'example', args: {url: 'https://github.com/heroku/heroku-buildpack-ruby'},
        flags: {index: '1'},
      }).then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`Buildpack added. Next release on example will use:
  1. https://github.com/heroku/heroku-buildpack-ruby
  2. https://github.com/heroku/heroku-buildpack-java
Run git push heroku master to create a new release using these buildpacks.
`);
      });
    });

    it('# with two existing buildpacks successfully inserts a buildpack URL at index', function() {
      stub_get(
        "https://github.com/heroku/heroku-buildpack-java", 
        "https://github.com/heroku/heroku-buildpack-nodejs"
      );

      let mock = stub_put(
        'https://github.com/heroku/heroku-buildpack-java',
        'https://github.com/heroku/heroku-buildpack-ruby',
        'https://github.com/heroku/heroku-buildpack-nodejs' 
      );

      return buildpacks.run({
        app: 'example', args: {url: 'https://github.com/heroku/heroku-buildpack-ruby'},
        flags: {index: '2'},
      }).then(function() {
        mock.done();
        expect(cli.stderr).to.equal('');
        expect(cli.stdout).to.equal(
`Buildpack added. Next release on example will use:
  1. https://github.com/heroku/heroku-buildpack-java
  2. https://github.com/heroku/heroku-buildpack-ruby
  3. https://github.com/heroku/heroku-buildpack-nodejs
Run git push heroku master to create a new release using these buildpacks.
`);
      });
    });

    it('# returns an error message when i is not an integer', function() {
      return assert_exit(1, buildpacks.run({
        app: 'example', args: {url: 'http://github.com/bar/bar'},
        flags: {index: 'notaninteger'},
      })).then(function() {
        expect(cli.stderr).to.equal(' ▸    Invalid index. Must be greater than 0.\n');
      });
    });

    it('# returns an error message when i < 0', function() {
      return assert_exit(1, buildpacks.run({
        app: 'example', args: {url: 'http://github.com/bar/bar'},
        flags: {index: '-1'},
      })).then(function() {
        expect(cli.stderr).to.equal(' ▸    Invalid index. Must be greater than 0.\n');
      });
    });

  });
});
