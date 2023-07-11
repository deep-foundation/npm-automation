import { SemVer } from 'semver';
import semver from 'semver';
import { type PackageJson } from 'types-package-json';
import createDebugMessages from 'debug';
import { execa } from 'execa';
const debug = createDebugMessages(
  '@deep-foundation/npm-automation:npm-install'
);
import { Package } from "@deep-foundation/deeplinks/imports/packager";
import { writeFile } from 'fs-extra';


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
export async function npmInstall(param: NpmInstallParam) {
  debug({ param });
  const { name: name, version, deepJsonFilePath, packageJsonFilePath } = param;

  const isVersionValid = version && semver.validRange(version);
  debug({ isVersionValid });
  if (!isVersionValid) {
    throw new Error(`Invalid version ${version}`);
  }
  let npmInstallCommandArgs = [`install`];
  if (version) {
    npmInstallCommandArgs.push(`${name}@${version}`);
  } else {
    npmInstallCommandArgs.push(name);
  }
  debug({ npmInstallCommandArgs });
  await execa(`npm`, npmInstallCommandArgs);

  const { default: packageJson }: { default: Partial<PackageJson> } =
    await import(packageJsonFilePath, { assert: { type: 'json' } });
  debug({ packageJson });
  const packageJsonDependencyVersion = packageJson.dependencies![name];
  debug({ packageJsonDependencyVersion });

  const { default: deepJson }: { default: Package } = await import(
    deepJsonFilePath,
    { assert: { type: 'json' } }
  );
  debug({ deepJson });
  if(!deepJson.dependencies) {
    deepJson.dependencies = []
  }
  const deepJsonDependencyIndex = deepJson.dependencies.findIndex(
    (dependency) => dependency.name === name
  );
  debug({ deepJsonDependencyIndex });
  if(deepJsonDependencyIndex === -1) {
    deepJson.dependencies.push({
      name,
      version: packageJsonDependencyVersion,
    })
  } else {
    deepJson.dependencies[deepJsonDependencyIndex].version =
    packageJsonDependencyVersion;
  }

  await writeFile(deepJsonFilePath, JSON.stringify(deepJson, null, 2));
}

export interface NpmInstallParam {
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
