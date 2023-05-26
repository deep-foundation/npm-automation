import exec from '@simplyhexagonal/exec';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';

main();

async function main() {
   program
   .name('npm-pull')
   .description('Pull latest version of a package from npm')
   .addHelpText('after', `
   
   Before pulling, if there are unstaged changes, it throws an error that tells you to stash (git stash) or commit (git commit) your changes.`)

  program.option('--package-name @deep-foundation/npm-releasee', 'Package name');

  program.parse(process.argv);

  const { packageName } = program.opts();
  if (!packageName) {
    throw new Error('Package name is required');
  }


  const { execPromise: gitDiffExecPromise } = exec(`git diff`);
  const gitDiffResult = await gitDiffExecPromise;
  if (gitDiffResult.stdoutOutput) {
    throw new Error(
      'You have unstaged changes. Stash (git stash) or commit (git commit) them'
    );
  }

  const { execPromise: npmInstallExecPromise } = exec(
    `npm install ${packageName}@latest --no-save`
  );
  const npmInstallResult = await npmInstallExecPromise;
  if (npmInstallResult.exitCode !== 0) {
    throw new Error(npmInstallResult.stderrOutput.trim());
  }

  fs.renameSync(
    path.resolve(`node_modules/${packageName}`),
    path.resolve(`./`)
  );
}
