import path from 'path';
import { program } from 'commander';
import { npmRelease } from './npm-release.js';

main();

async function main() {
  program
    .name('npm-release')
    .description('Release a package to npm')
    .addHelpText(
      'after',
      `
   
   Before releaseing deep.json version syncronizes with package.json version. Package will not be releaseed if there are newer version in npm`
    );

  program
    .option('--new-version <new_version>', 'New version to release')
    .option(
      '--package-json-file-path <package_json_file_path>',
      'package.json file path'
    )
    .option(
      '--deep-json-file-path <deep_json_file_path>',
      'deep.json file path'
    );

  program.parse(process.argv);

  const currentDir = process.cwd();
  const {
    newVersion = 'patch',
    packageJsonPath = path.join(currentDir,'package.json'),
    deepJsonFilePath = path.join(currentDir,'deep.json'),
  } = program.opts();

  await npmRelease({
    deepJsonFilePath,
    newVersion,
    packageJsonFilePath: packageJsonPath,
  });
}
