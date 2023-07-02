import exec from '@simplyhexagonal/exec/dist/exec.js';
import {lstat} from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { move } from 'fs-extra';
import createDebugMessages from 'debug';
import {fileURLToPath} from 'url'

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
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:npm-pull'
  );
  debug({param})
  const { packageName } = param;
  const { execPromise: gitDiffExecPromise } = exec(`git diff`);
  const gitDiffResult = await gitDiffExecPromise;
  debug({gitDiffResult})
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
  debug({npmInstallResult})
  const currentDir = process.cwd();
  debug({currentDir})
  const nodeModuleDirectoryPath = path.join(
    path.resolve(currentDir, `node_modules`),
    packageName
  );
  debug({nodeModuleDirectoryPath})
  const nodeModuleFilePaths = await glob(`${nodeModuleDirectoryPath}/**/*`, {
    ignore: [`dist`, `node_modules`],
    withFileTypes: true,
  });
  debug({nodeModuleFilePaths})
  await Promise.all(
    nodeModuleFilePaths.map(async (nodeModuleFilePath) => {
      if (!nodeModuleFilePath.isFile()) return;
      const moveSrc = nodeModuleFilePath.fullpath();
      debug({moveSrc})
      const moveDestination = path.join(
        currentDir,
        nodeModuleFilePath.fullpath().replace(nodeModuleDirectoryPath, '')
      );
      debug({moveDestination})
      return await move(
        moveSrc,
        moveDestination,
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
