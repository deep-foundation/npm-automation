
import { writeFile } from 'fs/promises';
import semver from 'semver'
import { type PackageJson } from 'types-package-json';
import createDebugMessages from 'debug';
import { Package, PackageIdentifier } from '@deep-foundation/deeplinks/imports/packager';
import fsExtra from 'fs-extra'

export interface SyncDependenciesOptions {
  /**
   * Path to deep.json
   */
  deepJsonFilePath: string;
  /**
   * Path to package.json
   */
  packageJsonFilePath: string;
}

/**
 * Syncronizes dependencies between {@link SyncDependenciesOptions.deepJsonFilePath} and {@link SyncDependenciesOptions.packageJsonFilePath}
 */
export async function syncDependencies(param: SyncDependenciesOptions) {
  const log = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependencies'
  );
  log({param})
  const {
    deepJsonFilePath,
    packageJsonFilePath: packageJsonPath,
  } = param;
  const deepJson: Package = await fsExtra.readJson(deepJsonFilePath) ;
  log({deepJson})
  const packageJson:  Partial<PackageJson> = await fsExtra.readJson(packageJsonPath);
  log({packageJson})

  if(!deepJson.dependencies) {
    return;
  }
  if(!packageJson.dependencies) {
    packageJson.dependencies = {};
  } 
  const deepJsonDependencies = Object.values(deepJson.dependencies);

  const packageJsonMissingDependenciesFromDeepJson = await getPackageJsonMissingDependenciesFromDeepJson({
    deepJsonDependencies: deepJsonDependencies,
    packageJsonDependencies: packageJson.dependencies
  });
  log({packageJsonMissingDependenciesFromDeepJson})
  packageJsonMissingDependenciesFromDeepJson.forEach((dependency) => {
    packageJson.dependencies = {...packageJson.dependencies, [dependency.name]: `~${dependency.version}`};
  })
  log({packageJsonDependenciesAfterAddingMissingDependencies: packageJson.dependencies})

  const syncDependenciesBasedOnDeepJsonResult = await syncDependenciesBasedOnDeepJson({
    deepJsonDependencies: deepJsonDependencies,
    packageJsonDependencies: packageJson.dependencies
  })
  log({syncDependenciesBasedOnDeepJsonResult})
  deepJson.dependencies = syncDependenciesBasedOnDeepJsonResult.deepJsonDependencies
  packageJson.dependencies = syncDependenciesBasedOnDeepJsonResult.packageJsonDependencies
  log({deepJsonDependenciesAfterMergingWithSyncDependenciesBasedOnDeepJsonResult: deepJson.dependencies});
  log({packageJsonDependenciesAfterMergingWithSyncDependenciesBasedOnDeepJsonResult: packageJson.dependencies});
  const syncDependenciesBasedOnPackageJsonResult = await syncDependenciesBasedOnPackageJson({
    deepJsonDependencies: deepJsonDependencies,
    packageJsonDependencies: packageJson.dependencies
  })
  log({syncDependenciesBasedOnPackageJsonResult})
  deepJson.dependencies = syncDependenciesBasedOnPackageJsonResult.deepJsonDependencies;
  packageJson.dependencies = syncDependenciesBasedOnPackageJsonResult.packageJsonDependencies;
  log({deepJsonDependenciesAfterMergingWithSyncDependenciesBasedOnPackageJsonResult: deepJson.dependencies});
  log({packageJsonDependenciesAfterMergingWithSyncDependenciesBasedOnPackageJsonResult: packageJson.dependencies});

  log({resultDeepJsonDependencies: deepJson.dependencies})
  log({resultPackageJsonDependencies: packageJson.dependencies})

  await writeFile(deepJsonFilePath, JSON.stringify(deepJson, null, 2));
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function syncDependenciesBasedOnDeepJson(param: {deepJsonDependencies: Array<PackageIdentifier>, packageJsonDependencies: Exclude<PackageJson['dependencies'], undefined>}) {
  const log = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependenciesBasedOnDeepJson'
  );
  log({param})
  const {deepJsonDependencies, packageJsonDependencies} = param;
  let resultPackageJsonDependencies = {...packageJsonDependencies};
  log({packageJsonDependencies: resultPackageJsonDependencies})
  let resultDeepJsonDependencies = [...deepJsonDependencies];
  log({deepJsonDependencies: resultDeepJsonDependencies})
  deepJsonDependencies.forEach((dependency, index) => {
    log({dependency, index})
    if(!dependency.version) {
      return;
    }
    const deepJsonDependencyVersionWithoutRange = semver.minVersion(dependency.version)?.version;
    log({dependencyVersionWithoutRange: deepJsonDependencyVersionWithoutRange})
    if(!deepJsonDependencyVersionWithoutRange) {
      return
    };
    const packageJsonDependencyVersionWithoutRange = semver.minVersion(packageJsonDependencies![dependency.name])?.version;
    log({packageJsonDependencyVersionWithoutRange})
    if(!packageJsonDependencyVersionWithoutRange) {
      return
    };
    const isDeepJsonVersionGreater = semver.gt(deepJsonDependencyVersionWithoutRange, packageJsonDependencyVersionWithoutRange);
    if(isDeepJsonVersionGreater) {
      resultPackageJsonDependencies![dependency.name] = `~${deepJsonDependencyVersionWithoutRange}`;
    } else {
      resultDeepJsonDependencies[index] = {
        name: dependency.name,
        version: deepJsonDependencyVersionWithoutRange
      };
    }
  })
  const result = {packageJsonDependencies: resultPackageJsonDependencies, deepJsonDependencies: resultDeepJsonDependencies};
  log({result})
  return result
}

async function syncDependenciesBasedOnPackageJson(param: {deepJsonDependencies: Array<PackageIdentifier>, packageJsonDependencies: Exclude<PackageJson['dependencies'], undefined>}) {
  const log = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependenciesBasedOnPackageJson'
  );
  log({param})
  const {deepJsonDependencies, packageJsonDependencies} = param;
  const resultPackageJsonDependencies = {...packageJsonDependencies};
  let resultDeepJsonDependencies = [...deepJsonDependencies];
  log({deepJsonDependencies: resultDeepJsonDependencies})
  Object.entries(resultPackageJsonDependencies).forEach(([dependencyName, dependencyVersion]) => { 
    log({dependencyName, dependencyVersion})
    const packageJsonDependencyVersionWithoutRange = semver.minVersion(dependencyVersion)?.version;
    log({dependencyVersionWithoutRange: packageJsonDependencyVersionWithoutRange})
    if(!packageJsonDependencyVersionWithoutRange) {
      return
    };
    const deepJsonDependencyIndex = resultDeepJsonDependencies.findIndex(dependency => dependency.name === dependencyName);
    log({deepJsonDependencyIndex})
    if(deepJsonDependencyIndex === -1) return;
    const deepJsonDependency = resultDeepJsonDependencies[deepJsonDependencyIndex];
    log({deepJsonDependency})
    if(!deepJsonDependency.version) {
      return;
    }
    const deepJsonDependencyVersionWithoutRange = semver.minVersion(deepJsonDependency.version)?.version;
    log({deepJsonDependencyVersionWithoutRange})
    if(!deepJsonDependencyVersionWithoutRange) {
      return
    };
    const isPackageJsonVersionGreater = semver.gt(packageJsonDependencyVersionWithoutRange, deepJsonDependencyVersionWithoutRange);
    if(isPackageJsonVersionGreater) {
      resultDeepJsonDependencies[deepJsonDependencyIndex] = {
        name: dependencyName,
        version: packageJsonDependencyVersionWithoutRange
      };
    } else {
      resultPackageJsonDependencies![dependencyName] = `~${deepJsonDependencyVersionWithoutRange}`;
    }
  })
  const result = {packageJsonDependencies: resultPackageJsonDependencies, deepJsonDependencies: resultDeepJsonDependencies};
  log({result})
  return result
}

async function getPackageJsonMissingDependenciesFromDeepJson(param: {deepJsonDependencies: Array<PackageIdentifier>, packageJsonDependencies: Exclude<PackageJson['dependencies'], undefined>}): Promise<Array<PackageIdentifier>> {
  const log = createDebugMessages(
    '@deep-foundation/npm-automation:getPackageJsonMissingDependenciesFromDeepJson'
  );
  const {deepJsonDependencies, packageJsonDependencies} = param;
  const missingDependenciesFromDeepJson = deepJsonDependencies.filter((dependency) => packageJsonDependencies[dependency.name] === undefined);
  log({missingDependenciesFromDeepJson})
  return missingDependenciesFromDeepJson
}