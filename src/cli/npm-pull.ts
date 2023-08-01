#!/usr/bin/env node
import { program } from 'commander';
import path from 'path';
import { npmPull } from '../npm-pull.js';
import  createLogger from 'debug';
import {fileURLToPath} from 'url'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fsExtra from 'fs-extra';


npmPullCli();

async function npmPullCli() {
  const log = createLogger(
    '@deep-foundation/npm-automation:npmPullCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
  .usage(`$0 [Options]`, `Pulls latest version of a package from npm. Before pulling, if there are unstaged changes, it throws an error that tells you to stash (git stash) or commit (git commit) your changes`)
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

  log({cliOptions})
  
  const currentDir = process.cwd();
  const packageJsonFilePath = path.join(currentDir,'package.json');
  log({packageJsonFilePath})
  const {default: packageJson} = await fsExtra.readJson(packageJsonFilePath);
  log({packageJson})
  if(!cliOptions.packageName && !packageJson.name) {
    throw new Error(`--package-name option is not provided and package.json file does not exist in ${packageJsonFilePath}`);
  }
  const packageName = cliOptions.packageName ?? packageJson.name;
  log({packageName})
  if(!packageName) {
    throw new Error(`Failed to find package name in ${packageJsonFilePath}`);
  }

  await npmPull({
    packageName,
    packageVersion: cliOptions.packageVersion,
  });
}
