import exec from '@simplyhexagonal/exec';
import { execAndLogStdoutOrThrowError } from './exec-and-log-stdout-or-throw-error.js';
import { updateDeepJsonVersion } from './update-version-in-json-object.js';
import { syncDependencies } from './sync-dependencies.js';
import createDebugMessages from 'debug';

/**
 * Releases a new version of the deep npm package and syncronizes the version and dependencies between {@link NpmReleaseParam.deepJsonFilePath} and {@link NpmReleaseParam.packageJsonFilePath}
 * 
 * @throws {@link Error} if the version in {@link NpmReleaseParam.packageJsonFilePath} is outdated
 * 
 * @example
```typescript
await npmRelease({
  newVersion: '1.0.0',
  packageJsonFilePath: 'package.json',
  deepJsonFilePath: 'deep.json',
})
```
 * 
 */
export async function npmRelease(param: NpmReleaseParam) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:npm-release'
  );
  debug({ param });
  const {
    deepJsonFilePath,
    newVersion,
    packageJsonFilePath,
  } = param;
  await syncDependencies({ deepJsonFilePath, packageJsonFilePath: packageJsonFilePath });
  
  const packageJson = await import(packageJsonFilePath, {assert: {type: 'json'}});
  debug({packageJson})
  const { execPromise } = exec(`npm view ${packageJson.name} version`);
  const npmViewExecResult = await execPromise;
  debug({npmViewExecResult})
  if (npmViewExecResult.exitCode !== 0) {
    throw new Error(npmViewExecResult.stderrOutput.trim());
  }
  const npmLatestPackageJsonVersion = npmViewExecResult.stdoutOutput.toString().trim();
  debug({npmLatestPackageJsonVersion})
  const packageJsonVersion = packageJson.version;
  const isPackageJsonVersionOutdated = npmLatestPackageJsonVersion > packageJsonVersion;
  debug({isPackageJsonVersionOutdated})
  if (isPackageJsonVersionOutdated) {
    throw new Error(
      `Version ${packageJson.version} in ${packageJsonFilePath} is outdated. Latest version in npm is ${npmLatestPackageJsonVersion}. Execute npm-pull`
    );
  } else {
    const {
      execResult: { stdoutOutput: npmVersionStdoutOutput },
    } = await execAndLogStdoutOrThrowError({
      command: `npm version --allow-same-version --no-git-tag-version ${newVersion}`,
    });
    debug({npmVersionStdoutOutput})
    await updateDeepJsonVersion({
      version: npmVersionStdoutOutput.trimEnd().slice(1),
      filePath: deepJsonFilePath,
    });
  }
}

export interface NpmReleaseParam {
  /**
   * New version to release
   * 
   * @remarks
   * You can also use 'patch', 'minor' or 'major' to increase the version as you do with `npm version`
   */
  newVersion: string;
  /**
   * Path to package.json
   */
  packageJsonFilePath: string;
  /**
   * Path to deep.json
   */
  deepJsonFilePath: string;
}
