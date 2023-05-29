import exec from '@simplyhexagonal/exec';
import { move, pathExists } from 'fs-extra';
import { resolve } from 'path';
import fs from 'fs'

export async function npmPull({ packageName }: NpmPullParam) {
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

  const nodeModulePath = resolve(`node_modules/${packageName}`);
  if (!await pathExists(nodeModulePath)) {
    throw new Error(`Path ${nodeModulePath} does not exist`);
  }
  fs.renameSync(nodeModulePath, resolve(`./`));
}

export interface NpmPullParam {
  packageName: string;
}
