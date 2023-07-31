#!/usr/bin/env node
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { Package } from '@deep-foundation/deeplinks/imports/packager';
import { program } from 'commander';
// build.js
import fsExtra from 'fs-extra';
import path from 'path';
import { generatePackageClass } from '../generate-package-class.js';
import createDebugger from 'debug'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';


generatePackageClassCli();

async function generatePackageClassCli() {
  const log = createDebugger('generatePackageClassCli');

  const args = yargs(hideBin(process.argv))
  .usage(`$0 [Options]`, 'Generates a package class which extends Package class from `@deep-foundation/deeplinks/imports/package` and have fields for each link in the package and each that field is an object with id method which returns the id of the link and idLocal method which returns the local id of the link.')
  .option('package-name', {
    demandOption: false,
    describe: 'Package name',
    type: 'string'
  })
  .option(
    'deep-json-file-path',
    {
      demandOption: false,
      describe: 'Path to deep.json file',
      type: 'string'
    },
  )
  .option(
    'output-file-path',
    {
      demandOption: false,
      describe: 'Path to output file',
      type: 'string'
    },
  )
  .parseSync();

  log({args})

  const currentWorkingDirectory = process.cwd();
  log({currentWorkingDirectory})
  const {
    packageName = await fsExtra
      .readJson(path.resolve(currentWorkingDirectory, 'package.json'), {
        encoding: 'utf-8',
      })
      .then((packageJson) => packageJson.name)
      .catch(() => {
        throw new Error(
          `packageName option is not passed and package.json does not exist in the current directory`
        );
      }),
    deepJsonFilePath = path.resolve(currentWorkingDirectory, 'deep.json'),
    outputFilePath = path.resolve(currentWorkingDirectory, 'src', 'package.ts'),
  } = args;
  log({packageName, deepJsonFilePath, outputFilePath})
  const isDeepJsonFilePathExists = await fsExtra.exists(deepJsonFilePath);
  log({isDeepJsonFilePathExists})
  if(!isDeepJsonFilePathExists) {
    throw new Error(
      deepJsonFilePath
       ? `deep.json file does not exist in ${deepJsonFilePath}`
       : `--deepJsonFilePath options is not passed and deep.json file does not exist in the current directory`
   );
  }
  await generatePackageClass({
    deepJsonFilePath,
    outputFilePath,
    packageName
  })
}
