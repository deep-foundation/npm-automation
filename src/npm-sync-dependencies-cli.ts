import path from 'path';
import { program } from 'commander';
import { npmRelease } from './npm-release.js';
import { npmInstall } from './npm-install.js';
import { syncDependencies } from './sync-dependencies.js';

main();

async function main() {
  program
    .name('npm-sync-versions')
    .description('Syncronized deep.json and package.json dependencies')

  program
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
    packageJsonFilePath = path.resolve('package.json'),
    deepJsonFilePath = path.resolve('deep.json'),
  } = program.opts();

  await syncDependencies({
    packageJsonFilePath,
    deepJsonFilePath
  });
}
