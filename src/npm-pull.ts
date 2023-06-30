import exec from '@simplyhexagonal/exec/dist/exec.js';
import {lstat} from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { move } from 'fs-extra';

/**
 * Pulls the latest version of the npm package and copies it to the root folder
 * 
 * @throws {@link Error} if there are not commited changes 
 * @throws {@link Error} if the exit code of npm install is not 0
 * 
 * @example
```typescript
await npmPull({
  packageName: '@deep-foundation/deep-memo',
})
```
 * 
 */
export async function npmPull(param: NpmPullParam) {
  const { packageName } = param;
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

  const rootFolderPath = path.resolve(`./`);
  const nodeModuleDirectoryPath = path.join(
    path.resolve(`node_modules`),
    packageName
  );
  const nodeModulePath = path.resolve(`node_modules/${packageName}`);
  const nodeModuleFilePaths = await glob(`${nodeModulePath}/**/*`, {
    ignore: [`dist`, `node_modules`],
    withFileTypes: true,
  });
  await Promise.all(
    nodeModuleFilePaths.map(async (nodeModuleFilePath) => {
      if (!nodeModuleFilePath.isFile()) return;
      return await move(
        nodeModuleFilePath.fullpath(),
        path.join(
          rootFolderPath,
          nodeModuleFilePath.fullpath().replace(nodeModuleDirectoryPath, '')
        ),
        {
          overwrite: true,
        }
      );
    })
  );
}

export interface NpmPullParam {
  /**
   * Name of the npm package
   */
  packageName: string;
}
