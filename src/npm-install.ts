import { SemVer } from 'semver';
import semver from 'semver';
import { execAndLogStdoutOrThrowError } from './exec-and-log-stdout-or-throw-error';
import { DeepJson } from './deep-json';
import { type PackageJson } from 'types-package-json';

/**
 * Installs a package
 *
 * @throws {@link Error} if the version is invalid
 * @throws {@link Error} if the exit code of npm install is not 0
 * 
 * @async
 * @function
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
  const { packageName, version, deepJsonFilePath, packageJsonFilePath } = param;
  if (version && !semver.valid(version))
    throw new Error(`Invalid version ${version}`);
  let npmInstallCommand = `npm install ${packageName}`;
  if (version) {
    npmInstallCommand += `@${version}`;
  }
  await execAndLogStdoutOrThrowError({
    command: npmInstallCommand,
  });

  const { default: packageJson }: { default: Partial<PackageJson> } =
    await import(packageJsonFilePath, { assert: { type: 'json' } });
  const packageJsonDependencyVersion = packageJson.dependencies![packageName];

  const { default: deepJson }: { default: DeepJson } = await import(
    deepJsonFilePath,
    { assert: { type: 'json' } }
  );

  const deepJsonDependencyIndex = deepJson.dependencies.findIndex(
    (dependency) => dependency.name === packageName
  );
  deepJson.dependencies[deepJsonDependencyIndex].version =
    packageJsonDependencyVersion;
}

export interface NpmInstallParam {
  packageName: string;
  packageJsonFilePath: string;
  deepJsonFilePath: string;
  version: string | undefined;
}
