#!/usr/bin/env node
import path from 'path';
import { program } from 'commander';
import { npmRelease } from '../npm-release.js';
import { npmInstall } from '../npm-install.js';
import { syncDependencies } from '../sync-dependencies.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import createLogger from 'debug';

npmSyncDependenciesCli();

async function npmSyncDependenciesCli() {
  const log = createLogger(
    '@deep-foundation/npm-automation:npmSyncDependenciesCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
  .usage(`$0 [Options]`, `Syncronizes deep.json and package.json dependencies`)
  .option(`deep-json-file-path`, {
    demandOption: false,
    describe: 'deep.json file path',
    type: 'string'
    })
  .option(`package-json-file-path`, {
    demandOption: false,
    describe: 'package.json file path',
    type: 'string'
    })
  .parseSync();

  log({cliOptions})

  const {
    packageJsonFilePath = path.resolve('package.json'),
    deepJsonFilePath = path.resolve('deep.json'),
  } = cliOptions;

  await syncDependencies({
    packageJsonFilePath,
    deepJsonFilePath
  });
}
