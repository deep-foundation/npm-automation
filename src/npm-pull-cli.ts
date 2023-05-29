import exec from '@simplyhexagonal/exec';
import { program } from 'commander';
import fsExtra from 'fs-extra';
import path from 'path';
import { npmPull } from './npm-pull';

main();

async function main() {
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

  const { packageName } = program.opts();
  if (!packageName) {
    throw new Error('Package name is required');
  }

  await npmPull({
    packageName
  })
}
