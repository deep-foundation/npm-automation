import { syncDependencies } from './sync-dependencies.js';
import createDebugMessages from 'debug';
import { execa } from 'execa';
import fsExtra from 'fs-extra';
import { PackageJson } from 'types-package-json';

/**
 * Releases a new version of the deep npm package and syncronizes the version and dependencies between {@link NpmReleaseOptions.deepJsonFilePath} and {@link NpmReleaseOptions.packageJsonFilePath}
 * 
 * @throws {@link Error} if the version in {@link NpmReleaseOptions.packageJsonFilePath} is outdated
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
export async function npmRelease(param: NpmReleaseOptions) {
  const log = createDebugMessages(
    '@deep-foundation/npm-automation:npm-release'
  );
  log({ param });
  const {
    deepJsonFilePath,
    newVersion,
    packageJsonFilePath,
  } = param;
  await syncDependencies({ deepJsonFilePath, packageJsonFilePath: packageJsonFilePath });
  
  const {default: packageJson}: {default: Partial<PackageJson>} = await import(packageJsonFilePath, {assert: {type: 'json'}});
  log({packageJson})

  if(!packageJson.name) {
    throw new Error(`package.json does not have a name property`)
  }
  const npmViewExecResult = await execa(`npm`, [`view`, `${packageJson.name}`, `version`]);
  log({npmViewExecResult})
  if(!npmViewExecResult.stdout) {
    throw new Error(`${npmViewExecResult.command} output is empty`)
  }
  const npmLatestPackageJsonVersion = npmViewExecResult.stdout.toString().trim();
  log({npmLatestPackageJsonVersion})

  if(!packageJson.version) {
    throw new Error(`package.json does not have a version property`)
  }
  const packageJsonVersion = packageJson.version;
  const isPackageJsonVersionOutdated = npmLatestPackageJsonVersion > packageJsonVersion;
  log({isPackageJsonVersionOutdated})
  if (isPackageJsonVersionOutdated) {
    throw new Error(
      `Version ${packageJson.version} in ${packageJsonFilePath} is outdated. Latest version in npm is ${npmLatestPackageJsonVersion}. Execute npm-pull`
    );
  } else {
    const npmVersionExecResult = await execa(`npm`,  [`version`, `--allow-same-version`, `--no-git-tag-version`, newVersion]);
    log({npmVersionExecResult})
    if(!npmVersionExecResult.stdout) {
      throw new Error(`${npmVersionExecResult.command} output is empty`)
    }

    const {default: deepJson} = await import(deepJsonFilePath, {assert: {type: 'json'}});
    deepJson.package.version = npmVersionExecResult.stdout.trimEnd().slice(1);
    await fsExtra.writeFile(deepJsonFilePath, JSON.stringify(deepJson, null, 2));
  }
  
}

export interface NpmReleaseOptions {
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
