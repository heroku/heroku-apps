2.0.4 / 2016-05-11
==================

  * 2.0.4
  * updated deps
  * preauth apps:info ([#88](https://github.com/heroku/heroku-apps/issues/88))
  * switch to codecov for coverage ([#87](https://github.com/heroku/heroku-apps/issues/87))
  * fix pipeline
  * less yellow
  * clean up color usage
  * standard 7ify
  * fix create specs
  * show done message

2.0.3 / 2016-04-25
==================

  * 2.0.3
  * hide stack on apps:create
  * show new app name
  * use os.homedir()
  * Update README.md
  * test config var shell format
  * standardify ([#83](https://github.com/heroku/heroku-apps/issues/83))
  * Fix snake case to camel case
  * Display release status ([#64](https://github.com/heroku/heroku-apps/issues/64))
    * show releases status in info and index
    * set max to 1 for retrieving current release

2.0.2 / 2016-04-22
==================

  * 2.0.2
  * Merge pull request [#82](https://github.com/heroku/heroku-apps/issues/82) from heroku/add-yes-command-line-flag
    Add yes command line flag

2.0.1 / 2016-04-21
==================

  * 2.0.1
  * switch back to ruby for `heroku apps`
    failing due to https://github.com/heroku/api/issues/5885
  * hide dynos and resize from topics
  * remove changelog from preversion
    since it would not show the latest release, changelog is better run
    afterwards manually
  * changelog
  * disable sparklines on windows

2.0.0 / 2016-04-21
==================

  * 2.0.0
  * set TZ for npm test
  * move stack commands to apps:stacks ([#77](https://github.com/heroku/heroku-apps/issues/77))
  * added dashboard and related commands ([#59](https://github.com/heroku/heroku-apps/issues/59))
  * apps list command ([#29](https://github.com/heroku/heroku-apps/issues/29))
    * apps command
    * added space and org options to apps:list
    * finalize apps index
    * Adding tests and slight wording modifications
    * fix name of function
    * filter spaces by org
    * added test for collab app test
    * show account name on apps list
    * testing apps index more
    * show only org apps with --org and --all
  * fixed output of ps:scale ([#74](https://github.com/heroku/heroku-apps/issues/74))
  * improve config:* UX ([#76](https://github.com/heroku/heroku-apps/issues/76))
    added release back in and use consistent colors
  * added releases:info ([#25](https://github.com/heroku/heroku-apps/issues/25))
    * releases
    * added test
    * better testing on releases index
    * added --shell to releases:info
    * fix current config vars
    * fix tests
  * fixpack
  * ignore codeclimate false positives
  * added ISC license
  * badging
  * fix coveralls
  * fix badges
  * code coverage
  * ignore coverage directory
  * codeclimate
  * fix build
  * ps:type ([#53](https://github.com/heroku/heroku-apps/issues/53))
    * ps:type
    * fix tests
    * simplify output
    * set cost to blank in case it is a new type
    * ignore coverage directory from jshint
  * update maintenance test to match dev center article
  * simplify npm test
  * ignore coverage directory from jshint
  * added test cases for config index ([#71](https://github.com/heroku/heroku-apps/issues/71))
  * added more testing on ps index ([#70](https://github.com/heroku/heroku-apps/issues/70))
    * added more testing on ps index
    * added more tests for ps:scale
  * testing labs commands ([#69](https://github.com/heroku/heroku-apps/issues/69))
  * testing updates ([#68](https://github.com/heroku/heroku-apps/issues/68))
    * use bluebird instead of bluebird-queue
    * testing keys:add
  * added labs test ([#67](https://github.com/heroku/heroku-apps/issues/67))
  * keys:* ([#40](https://github.com/heroku/heroku-apps/issues/40))
    * added keys cmd
    * added keys:*
    * added basic test for keys:add
    * inquirer 1.x
    * allow removing duplicate keys
    * move mkdirp to util
    * better testing on keys index
  * added changelog
  * added changelog ([#66](https://github.com/heroku/heroku-apps/issues/66))

1.8.0 / 2016-04-18
==================

  * 1.8.0
  * use cli.colors.app() ([#65](https://github.com/heroku/heroku-apps/issues/65))
    * use cli.colors.app()
    this is so it will work with the new app style output
    * updated deps
  * indent index
  * added ps:restart and ps:stop ([#51](https://github.com/heroku/heroku-apps/issues/51))
    * added ps:restart
    * added ps:stop
    * added app to ps:stop/restart
  * update heroku-cli-util
  * remove cyan from drain index
  * add pipeline to apps:info ([#58](https://github.com/heroku/heroku-apps/issues/58))
    * add pipeline to apps:info
    also cleaned up dogwood code a bit
    * update heroku-cli-util
    * added test
  * testing for more coverage ([#62](https://github.com/heroku/heroku-apps/issues/62))
    * testing stack:*
    * added test for apps:destroy
  * Merge pull request [#61](https://github.com/heroku/heroku-apps/issues/61) from heroku/coverage
    added code coverage
  * added code coverage
  * 1.7.3
  * hide aliased commands from `heroku help`

1.7.3 / 2016-03-30
==================

  * switch to circle
  * 1.7.2

1.7.2 / 2016-03-30
==================

  * Merge pull request [#57](https://github.com/heroku/heroku-apps/issues/57) from heroku/add-on-drains
    fix drains for add-on drains
  * simplify
  * styled json for log drains
  * fix drains for add-on drains
  * 1.7.1
  * added apps:rename
  * 1.7.0

1.7.0 / 2016-03-29
==================

  * 1.6.0

1.6.0 / 2016-03-24
==================

  * Merge pull request [#36](https://github.com/heroku/heroku-apps/issues/36) from heroku/apps-open
    added apps:open
  * added apps:open

1.5.2 / 2016-03-23
==================

  * 1.5.2
  * Merge pull request [#56](https://github.com/heroku/heroku-apps/issues/56) from heroku/spread-fix
    Remove the spread operator from labs / features
  * Remove the spread operator from labs / features
  * 1.5.1
  * added color to ps

1.5.1 / 2016-03-22
==================

  * added ps:scale
  * 1.5.0
  * remove duplicate maintenance command

1.5.0 / 2016-03-22
==================

  * Merge pull request [#50](https://github.com/heroku/heroku-apps/issues/50) from heroku/features
    features:*
  * added features:*
  * added features index
  * 1.4.0
  * 1.3.0
  * shorten releases header
  * update confirmation warning

1.4.0 / 2016-03-22
==================

  * Merge pull request [#31](https://github.com/heroku/heroku-apps/issues/31) from heroku/labs
    labs commands
