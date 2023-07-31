#!/usr/bin/env node
import path from 'path';
import { program } from 'commander';
import { npmRelease } from '../npm-release.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import  createLogger from 'debug';

npmReleaseCli();

async function npmReleaseCli() {
  const log = createLogger(
    '@deep-foundation/npm-automation:npmReleaseCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
    .usage(`$0 [Options]`, `Releases a package version. Before releaseing deep.json version syncronizes with package.json version. Package will not be releaseed if there are newer version in npm`)
    .option('new-version', {
      demandOption: false,
      describe: 'New version to release',
      type: 'string'
    })
    .option(
      'package-json-file-path',
      {
        demandOption: false,
        describe: 'package.json file path',
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
    .parseSync();

  log({cliOptions})

  const currentDir = process.cwd();
  const {
    newVersion = 'patch',
    packageJsonFilePath = path.join(currentDir,'package.json'),
    deepJsonFilePath = path.join(currentDir,'deep.json'),
  } = cliOptions;

  await npmRelease({
    deepJsonFilePath,
    newVersion,
    packageJsonFilePath,
  });
}
