import { program } from 'commander';
import path from 'path';
import { npmPull } from './npm-pull.js';
import  createLogger from 'debug';
import {fileURLToPath} from 'url'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';


npmPullCli();

async function npmPullCli() {
  const debug = createLogger(
    '@deep-foundation/npm-automation:npmPullCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
  .describe(`npm-pull`, `Pulls latest version of a package from npm`)
  .epilog(`Before pulling, if there are unstaged changes, it throws an error that tells you to stash (git stash) or commit (git commit) your changes.`)
  .option('package-name', {
    demandOption: false,
    describe: 'Package name',
    type: 'string'
  })
  .option(
    'package-version',
    {
      demandOption: false,
      describe: 'Package version',
      type: 'string'
    },
  )
  .parseSync();

  debug({cliOptions})
  
  const currentDir = process.cwd();
  const packageJsonFilePath = path.join(currentDir,'package.json');
  debug({packageJsonFilePath})
  const {default: packageJson} = await import(packageJsonFilePath, {assert: {type: 'json'}});
  debug({packageJson})
  if(!cliOptions.packageName && !packageJson.name) {
    throw new Error(`--package-name option is not provided and package.json file does not exist in ${packageJsonFilePath}`);
  }
  const packageName = cliOptions.packageName ?? packageJson.name;
  debug({packageName})
  if(!packageName) {
    throw new Error(`Failed to find package name in ${packageJsonFilePath}`);
  }

  await npmPull({
    packageName,
    packageVersion: cliOptions.packageVersion,
  });
}
