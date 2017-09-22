import {Command} from 'cli-engine-heroku'

export default class Whoami extends Command {
  static topic = 'auth'
  static command = 'login'
  static description = 'login with your Heroku credentials'
  static aliases = ['login']
  static flags = [
    {name: 'sso', description: 'login for enterprise users under SSO'},
    {name: 'expires-in', char: 'e', description: 'duration of token in seconds', hasValue: true}
  ]

  async run () {
    this.cli.log('FOOBARBAZ')
    // await this.login()
    let {body: account} = await this.heroku.get('/account')
    this.cli.log(`Logged in as ${this.out.color.green(account.email)}`)
  }

  async login (retries = 10) {
    try {
      await this.heroku.login({save: true, sso: this.flags.sso, expires_in: this.flags['expires-in']})
    } catch (err) {
      if (err.statusCode === 401 && retries > 0) return this.login(retries - 1)
      throw err
    }
  }
}
