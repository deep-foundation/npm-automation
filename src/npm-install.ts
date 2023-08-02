import { SemVer } from 'semver';
import semver from 'semver';
import { type PackageJson } from 'types-package-json';
import createDebugMessages from 'debug';
import { execa } from 'execa';
const log = createDebugMessages(
  '@deep-foundation/npm-automation:npm-install'
);
import { Package } from "@deep-foundation/deeplinks/imports/packager";
import fsExtra from 'fs-extra';
import path from 'path';


/**
 * Installs a package
 *
 * @throws {@link Error} if the version is invalid
 * @throws {@link Error} if the exit code of npm install is not 0
 * 
 * @example
```typescript
await npmInstall({
   packageName: 'typescript',
   version: 'latest',
   deepJsonFilePath,
   packageJsonFilePath,
})
```
 */
export async function npmInstall(param: NpmInstallOptions) {
  log({ param });

  const currentDir = process.cwd();
  const { name: name, version, deepJsonFilePath = path.resolve(currentDir, 'deep.json'), packageJsonFilePath = path.resolve(currentDir, 'package.json'), packageLockJsonFilePath = path.resolve(currentDir, 'package-lock.json') } = param;

  const isVersionValid = version && (version === 'latest' || semver.validRange(version));
  log({ isVersionValid });
  if (!isVersionValid) {
    throw new Error(`Invalid version ${version}`);
  }
  let npmInstallCommandArgs = [`install`];
  if (version) {
    npmInstallCommandArgs.push(`${name}@${version}`);
  } else {
    npmInstallCommandArgs.push(name);
  }
  log({ npmInstallCommandArgs });
  await execa(`npm`, npmInstallCommandArgs);

  const packageJson: Partial<PackageJson> =
    await fsExtra.readJson(packageJsonFilePath);
  log({ packageJson });
  const packageJsonDependencyVersion = packageJson.dependencies![name];
  log({ packageJsonDependencyVersion });

  const deepJson: Package = await fsExtra.readJson(deepJsonFilePath);
  log({ deepJson });
  if(!deepJson.dependencies) {
    deepJson.dependencies = []
  }
  const deepJsonDependencies = Object.values(deepJson.dependencies);
  const deepJsonDependencyIndex = deepJsonDependencies.findIndex(
    (dependency) => dependency.name === name
  );
  log({ deepJsonDependencyIndex });
  const versionFromPackageLockJson = await fsExtra.readJson(packageLockJsonFilePath).then((packageLockJson: any) => {
    return packageLockJson.packages[`node_modules/${name}`].version as string
  });
  log({ versionFromPackageLockJson });
  if(deepJsonDependencyIndex === -1) {
    deepJsonDependencies.push({
      name,
      version: versionFromPackageLockJson,
    })
  } else {
    deepJsonDependencies[deepJsonDependencyIndex].version =
    versionFromPackageLockJson;
  }

  deepJson.dependencies = deepJsonDependencies;

  await fsExtra.writeFile(deepJsonFilePath, JSON.stringify(deepJson, null, 2));
}

export interface NpmInstallOptions {
  /**
   * Package name to install
   */
  name: string;
  /**
   * Path to package.json
   */
  packageJsonFilePath?: string;
  /**
   * Path to deep.json
   */
  deepJsonFilePath?: string;
  /**
   * Version to install
   */
  version: string;
  /**
   * Path to package-lock.json
   */
  packageLockJsonFilePath?: string;
}
