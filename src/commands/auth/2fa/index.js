// @flow

import {Command} from 'cli-engine-heroku'

export default class Index extends Command {
  static topic = 'auth'
  static command = '2fa'
  static description = 'check 2fa status'
  static aliases = ['2fa', 'twofactor']
  static help = `Example:

    $ heroku 2fa
     Two-factor authentication is enabled`
  static overview = `The 2fa module for Heroku. Be extra secure.`
  async run () {
    let {body: account} = await this.heroku.get('/account')
    if (account.two_factor_authentication) {
      this.out.log('Two-factor authentication is enabled')
    } else {
      this.out.log('Two-factor authentication is not enabled')
    }
  }
}
