import { SemVer } from 'semver';
import semver from 'semver';
import { DeepJson } from './deep-json.js';
import { type PackageJson } from 'types-package-json';
import createDebugMessages from 'debug';
import { execa } from 'execa';
const debug = createDebugMessages(
  '@deep-foundation/npm-automation:npm-install'
);

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

  const { default: deepJson }: { default: DeepJson } = await import(
    deepJsonFilePath,
    { assert: { type: 'json' } }
  );
  debug({ deepJson });

  const deepJsonDependencyIndex = deepJson.dependencies.findIndex(
    (dependency) => dependency.name === name
  );
  debug({ deepJsonDependencyIndex });
  if(deepJsonDependencyIndex === -1) {
    throw new Error(`Could not find dependency ${name} in deep.json`);
  }
  deepJson.dependencies[deepJsonDependencyIndex].version =
    packageJsonDependencyVersion;
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
