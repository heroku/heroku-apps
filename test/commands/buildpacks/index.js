'use strict'
/* globals describe beforeEach it */

const cli = require('heroku-cli-util')
const expect = require('chai').expect
const buildpacks = require('../../../commands/buildpacks')
const stub_get = require('../../stubs/buildpacks.js').get

describe('heroku buildpacks', function () {
  beforeEach(function () {
    cli.mockConsole()
  })

  it('# displays the buildpack URL', function () {
    stub_get('https://github.com/heroku/heroku-buildpack-ruby')

    return buildpacks.run({app: 'example'})
      .then(function () {
        expect(cli.stderr).to.equal('')
        expect(cli.stdout).to.equal(
          `=== example Buildpack URL
https://github.com/heroku/heroku-buildpack-ruby
`)
      })
  })

  it('# maps buildpack urns to names', function () {
    stub_get('urn:buildpack:heroku/ruby')

    return buildpacks.run({app: 'example'})
      .then(function () {
        expect(cli.stderr).to.equal('')
        expect(cli.stdout).to.equal(
          `=== example Buildpack URL
heroku/ruby
`)
      })
  })

  it('# does not map buildpack s3 to names', function () {
    stub_get('https://codon-buildpacks.s3.amazonaws.com/buildpacks/heroku/ruby.tgz')

    return buildpacks.run({app: 'example'})
      .then(function () {
        expect(cli.stderr).to.equal('')
        expect(cli.stdout).to.equal(
          `=== example Buildpack URL
https://codon-buildpacks.s3.amazonaws.com/buildpacks/heroku/ruby.tgz
`)
      })
  })

  it('# with no buildpack URL set does not display a buildpack URL', function () {
    stub_get()

    return buildpacks.run({app: 'example'})
      .then(function () {
        expect(cli.stderr).to.equal('')
        expect(cli.stdout).to.equal(
          `example has no Buildpack URL set.
`)
      })
  })

  it('# with two buildpack URLs set displays the buildpack URL', function () {
    stub_get(
      'https://github.com/heroku/heroku-buildpack-java',
      'https://github.com/heroku/heroku-buildpack-ruby'
    )
    return buildpacks.run({app: 'example'})
      .then(function () {
        expect(cli.stderr).to.equal('')
        expect(cli.stdout).to.equal(
          `=== example Buildpack URLs
1. https://github.com/heroku/heroku-buildpack-java
2. https://github.com/heroku/heroku-buildpack-ruby
`)
      })
  })
})
