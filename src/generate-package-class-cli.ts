import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { Package } from '@deep-foundation/deeplinks/imports/packager';
import { program } from 'commander';
// build.js
import fsExtra from 'fs-extra';
import path from 'path';
import { generatePackageClass } from './generate-package-class';

generatePackageClassCli();

async function generatePackageClassCli() {
  program
    .option('--package-name <name>', 'Package name')
    .option('--deep-json-file-path <path>', 'Path to deep.json file')
    .requiredOption('--output-file-path <path>', 'Path to output file');

  program.parse();

  const options = program.opts();

  const currentWorkingDirectory = process.cwd();
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
    outputFilePath,
  } = options;
  const isDeepJsonFilePathExists = await fsExtra.exists(deepJsonFilePath);
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
