import { updateDeepJsonVersion } from './update-version-in-json-object.js';
import { syncDependencies } from './sync-dependencies.js';
import createDebugMessages from 'debug';
import { execa } from 'execa';
import { PackageJson } from 'types-package-json';

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
  
  const {default: packageJson}: {default: Partial<PackageJson>} = await import(packageJsonFilePath, {assert: {type: 'json'}});
  debug({packageJson})

  if(!packageJson.name) {
    throw new Error(`package.json does not have a name property`)
  }
  const npmViewExecResult = await execa(`npm`, [`view`, `${packageJson.name} version`]);
  debug({npmViewExecResult})
  if(!npmViewExecResult.stdout) {
    throw new Error(`${npmViewExecResult.command} output is empty`)
  }
  const npmLatestPackageJsonVersion = npmViewExecResult.stdout.toString().trim();
  debug({npmLatestPackageJsonVersion})

  if(!packageJson.version) {
    throw new Error(`package.json does not have a version property`)
  }
  const packageJsonVersion = packageJson.version;
  const isPackageJsonVersionOutdated = npmLatestPackageJsonVersion > packageJsonVersion;
  debug({isPackageJsonVersionOutdated})
  if (isPackageJsonVersionOutdated) {
    throw new Error(
      `Version ${packageJson.version} in ${packageJsonFilePath} is outdated. Latest version in npm is ${npmLatestPackageJsonVersion}. Execute npm-pull`
    );
  } else {
    const npmVersionExecResult = await execa(`npm`,  [`version`, `--allow-same-version`, `--no-git-tag-version`, newVersion]);
    debug({npmVersionExecResult})
    if(!npmVersionExecResult.stdout) {
      throw new Error(`${npmVersionExecResult.command} output is empty`)
    }

    await updateDeepJsonVersion({
      version: npmVersionExecResult.stdout.trimEnd().slice(1),
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
