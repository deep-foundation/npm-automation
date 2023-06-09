import path from 'path';
import { program } from 'commander';
import { npmRelease } from './npm-release.js';
import { npmInstall } from './npm-install.js';

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

  const currentDir = process.cwd();
  const {
    name,
    version,
    packageJsonFilePath = path.join(currentDir,'package.json'),
    deepJsonFilePath = path.join(currentDir,'deep.json'),
  } = program.opts();

  await npmInstall({
    name: name,
    version,
    packageJsonFilePath,
    deepJsonFilePath
  });
}
