#!/usr/bin/env node
import path from 'path';
import { program } from 'commander';
import { npmRelease } from './npm-release.js';
import { npmInstall } from './npm-install.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import createLogger from 'debug';

npmInstallCli();

async function npmInstallCli() {
  const debug = createLogger(
    '@deep-foundation/npm-automation:npmInstallCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
  .describe(`npm-install`, `Installs a package and syncronizes deep.json and package.json dependencies`)
  .option('name', {
    demandOption: true,
    describe: 'Package name to install',
    type: 'string'
  })
  .option(
    'version',
    {
      demandOption: true,
      describe: 'Version to install',
      type: 'string'
    },
  )
  .option(
    'deep-json-file-path',
    {
      demandOption: false,
      describe: 'deep.json file path',
      type: 'string'
    },
  )
  .option(
    'package-json-file-path',
    {
      demandOption: false,
      describe: 'package.json file path',
      type: 'string'
    },
  )
  .parseSync();

  debug({cliOptions})

  const currentDir = process.cwd();
  const {
    name,
    version,
    packageJsonFilePath = path.join(currentDir,'package.json'),
    deepJsonFilePath = path.join(currentDir,'deep.json'),
  } = cliOptions;

  await npmInstall({
    name: name,
    version,
    packageJsonFilePath,
    deepJsonFilePath
  });
}
