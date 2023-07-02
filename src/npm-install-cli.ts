import path from 'path';
import exec from '@simplyhexagonal/exec';
import { program } from 'commander';
import { execAndLogStdoutOrThrowError } from './exec-and-log-stdout-or-throw-error.js';
import { npmRelease } from './npm-release.js';
import { npmInstall } from './npm-install.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

main();

async function main() {
  program
    .name('npm-install')
    .description('Installs a package and syncronizes deep.json and package.json dependencies')

  program
    .requiredOption('--name <name>', 'Package name to install')
    .requiredOption(
      '--version <version>',
      'Version to install'
    )
    .option(
      '--deep-json-file-path <deep_json_file_path>',
      'deep.json file path'
    )
    .option(
      '--package-json-file-path <package_json_file_path>',
      'package.json file path'
    )

  program.parse(process.argv);

  const {
    name,
    version,
    packageJsonFilePath = require.resolve('package.json'),
    deepJsonFilePath = require.resolve('deep.json'),
  } = program.opts();

  await npmInstall({
    name: name,
    version,
    packageJsonFilePath,
    deepJsonFilePath
  });
}
