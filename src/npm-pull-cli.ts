import exec from '@simplyhexagonal/exec';
import { program } from 'commander';
import path from 'path';
import { npmPull } from './npm-pull.js';
import  createDebugMessages from 'debug';
import {fileURLToPath} from 'url'


main();

async function main() {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:npm-pull-cli'
  );
  program
    .name('npm-pull')
    .description('Pull latest version of a package from npm')
    .addHelpText(
      'after',
      `
   
   Before pulling, if there are unstaged changes, it throws an error that tells you to stash (git stash) or commit (git commit) your changes.`
    );

  program.option('--package-name <name>', 'Package name');
  program.option('--package-version <version>', 'Package version');

  program.parse(process.argv);

  let options = program.opts();
  debug({options})

  const currentDir = process.cwd();
  const packageJsonFilePath = path.join(currentDir,'package.json');
  debug({packageJsonFilePath})
  const {default: packageJson} = await import(packageJsonFilePath, {assert: {type: 'json'}});
  debug({packageJson})
  if(!options.packageName && !packageJson.name) {
    throw new Error(`--package-name option is not provided and package.json file does not exist in ${packageJsonFilePath}`);
  }
  const packageName = options.packageName ?? packageJson.name;
  debug({packageName})
  if(!packageName) {
    throw new Error(`Failed to find package name in ${packageJsonFilePath}`);
  }

  await npmPull({
    packageName,
    packageVersion: options.packageVersion,
  });
}
