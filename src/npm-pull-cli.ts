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

  let options = program.opts();
  const packageName = options.packageName ?? await import(path.resolve('package.json')).then(
    (pkg) => pkg.name
  );

  await npmPull({
    packageName,
  });
}
