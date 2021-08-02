const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// const usageMsg = '`-s <Your Scenario File> -d <Target Directory> [-t <pug|xml|yaml|json>]`'

const options = {
  s: { alias: 'from', describe: 'Your Scenario File Path' },
  d: { alias: 'to', describe: 'Target Directory Path' },
  t: { alias: 'type', describe: 'Scenario File Type, One of [pug|xml|yaml|json]' },
}

const argv = yargs(hideBin(process.argv)).alias('h', 'help').help()
  .alias('v', 'version').version(require('../package').version)
  .demandOption(['s'], 'Plz Set Your Scenario File Path')
  .options(options).locale('en').argv

module.exports = argv
