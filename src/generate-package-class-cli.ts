import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { Package } from '@deep-foundation/deeplinks/imports/packager';
import { program } from 'commander';
// build.js
import fsExtra from 'fs-extra';
import path from 'path';
import { generatePackageClass } from './generate-package-class.js';
import createDebugger from 'debug'
import yargs from 'yargs/yargs.js';
import { hideBin } from 'yargs/helpers';


generatePackageClassCli();

async function generatePackageClassCli() {
  const debug = createDebugger('generatePackageClassCli');

  const args = yargs(hideBin(process.argv))
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

  debug({args})

  const currentWorkingDirectory = process.cwd();
  debug({currentWorkingDirectory})
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
  debug({packageName, deepJsonFilePath, outputFilePath})
  const isDeepJsonFilePathExists = await fsExtra.exists(deepJsonFilePath);
  debug({isDeepJsonFilePathExists})
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
