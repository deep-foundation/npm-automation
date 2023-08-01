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
  const { name: name, version, deepJsonFilePath, packageJsonFilePath } = param;

  const isVersionValid = version && semver.validRange(version);
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
  if(deepJsonDependencyIndex === -1) {
    deepJsonDependencies.push({
      name,
      version: packageJsonDependencyVersion,
    })
  } else {
    deepJsonDependencies[deepJsonDependencyIndex].version =
    packageJsonDependencyVersion;
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
  packageJsonFilePath: string;
  /**
   * Path to deep.json
   */
  deepJsonFilePath: string;
  /**
   * Version to install
   */
  version: string;
}
