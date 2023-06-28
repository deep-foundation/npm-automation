import { SemVer } from 'semver';
import semver from 'semver';
import { execAndLogStdoutOrThrowError } from './exec-and-log-stdout-or-throw-error.js';
import { DeepJson } from './deep-json.js';
import { type PackageJson } from 'types-package-json';

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
  const { name: name, version, deepJsonFilePath, packageJsonFilePath } = param;
  if (version && !semver.valid(version))
    throw new Error(`Invalid version ${version}`);
  let npmInstallCommand = `npm install ${name}`;
  if (version) {
    npmInstallCommand += `@${version}`;
  }
  await execAndLogStdoutOrThrowError({
    command: npmInstallCommand,
  });

  const { default: packageJson }: { default: Partial<PackageJson> } =
    await import(packageJsonFilePath, { assert: { type: 'json' } });
  const packageJsonDependencyVersion = packageJson.dependencies![name];

  const { default: deepJson }: { default: DeepJson } = await import(
    deepJsonFilePath,
    { assert: { type: 'json' } }
  );

  const deepJsonDependencyIndex = deepJson.dependencies.findIndex(
    (dependency) => dependency.name === name
  );
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
