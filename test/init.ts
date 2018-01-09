import cli from 'cli-ux'
import * as nock from 'nock'

nock.disableNetConnect()

beforeEach(() => {
  cli.mock = true
})

afterEach(() => {
  nock.cleanAll()
})

process.stdout.columns = 80 // Set screen width for consistent wrapping
process.stderr.columns = 80 // Set screen width for consistent wrapping
