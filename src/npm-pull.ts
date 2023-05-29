import exec from '@simplyhexagonal/exec';
import { move } from 'fs-extra';
import { resolve } from 'path';

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

  await move(resolve(`node_modules/${packageName}`), resolve(`./`), {
    overwrite: true,
  });
}

export interface NpmPullParam {
  packageName: string;
}
