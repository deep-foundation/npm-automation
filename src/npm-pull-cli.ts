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

  program.option('--package-name @deep-foundation/npm-release', 'Package name');

  program.parse(process.argv);

  let options = program.opts();
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const packageJsonFilePath = path.resolve(dirname,'package.json');
  debug({packageJsonFilePath})
  const packageName = options.packageName ?? await import(packageJsonFilePath, {assert: {type: 'json'}}).then(
    (pkg) => pkg.name
  );
  debug({packageName})

  await npmPull({
    packageName,
  });
}
