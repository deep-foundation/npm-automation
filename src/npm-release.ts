import exec from '@simplyhexagonal/exec';
import { execAndLogStdoutOrThrowError } from './exec-and-log-stdout-or-throw-error';
import { updateDeepJsonVersion } from './update-version-in-json-object';
import { syncDependencies } from './sync-dependencies';

/**
 * Releases a new version of the deep npm package and syncronizes the version and dependencies between {@link NpmReleaseParam.deepJsonFilePath} and {@link NpmReleaseParam.packageJsonFilePath}
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
 * @async
 * @function
 */
export async function npmRelease({
  deepJsonFilePath,
  newVersion,
  packageJsonFilePath: packageJsonPath,
}: NpmReleaseParam) {
  await syncDependencies({ deepJsonFilePath, packageJsonFilePath: packageJsonPath });
  
  const packageJson = await import(packageJsonPath);
  const { execPromise } = exec(`npm view ${packageJson.name} version`);
  const execResult = await execPromise;
  if (execResult.exitCode !== 0) {
    throw new Error(execResult.stderrOutput.trim());
  }
  const npmLatestPackageJsonVersion = execResult.stdoutOutput.toString().trim();
  const packageJsonVersion = packageJson.version;
  if (npmLatestPackageJsonVersion > packageJsonVersion) {
    throw new Error(
      `Version ${packageJson.version} in ${packageJsonPath} is outdated. Latest version in npm is ${npmLatestPackageJsonVersion}. Execute npm-pull`
    );
  }
  if (npmLatestPackageJsonVersion <= packageJsonVersion) {
    const {
      execResult: { stdoutOutput: npmVersionStdoutOutput },
    } = await execAndLogStdoutOrThrowError({
      command: `npm version --allow-same-version --no-git-tag-version ${newVersion}`,
    });
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
