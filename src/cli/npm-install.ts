#!/usr/bin/env node
import path from 'path';
import { program } from 'commander';
import { npmRelease } from '../npm-release.js';
import { npmInstall } from '../npm-install.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import createLogger from 'debug';

npmInstallCli();

async function npmInstallCli() {
  const log = createLogger(
    '@deep-foundation/npm-automation:npmInstallCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
  .usage(`$0 [Options]`, `Installs a package and syncronizes deep.json and package.json dependencies`)
  .option('package-name', {
    demandOption: true,
    describe: 'Package name to install',
    type: 'string'
  })
  .option(
    'package-version',
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
  .option(
    'package-lock-json-file-path',
    {
      demandOption: false,
      describe: 'package-lock.json file path',
      type: 'string'
    },
  )
  .parseSync();

  log({cliOptions})

  const {
    packageName,
    packageVersion,
    packageJsonFilePath,
    deepJsonFilePath,
    packageLockJsonFilePath
  } = cliOptions;

  await npmInstall({
    name: packageName,
    version: packageVersion,
    packageJsonFilePath,
    deepJsonFilePath,
    packageLockJsonFilePath
  });
}
