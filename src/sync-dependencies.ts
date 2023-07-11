
import { writeFile } from 'fs/promises';
import semver from 'semver'
import { type PackageJson } from 'types-package-json';
import createDebugMessages from 'debug';
import { Package } from '@deep-foundation/deeplinks/imports/packager';

export interface SyncDependenciesParam {
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
 * Syncronizes dependencies between {@link SyncDependenciesParam.deepJsonFilePath} and {@link SyncDependenciesParam.packageJsonFilePath}
 */
export async function syncDependencies(param: SyncDependenciesParam) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependencies'
  );
  debug({param})
  const {
    deepJsonFilePath,
    packageJsonFilePath: packageJsonPath,
  } = param;
  const {default: deepJson}: {default: Package} = await import(deepJsonFilePath, {assert: {type: 'json'}}) ;
  debug({deepJson})
  const {default: packageJson}: {default: Partial<PackageJson>} = await import(packageJsonPath, {assert: {type: 'json'}});
  debug({packageJson})

  if(!deepJson.dependencies) {
    return;
  }
  if(!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  const packageJsonMissingDependenciesFromDeepJson = await getPackageJsonMissingDependenciesFromDeepJson({
    deepJsonDependencies: deepJson.dependencies,
    packageJsonDependencies: packageJson.dependencies
  });
  debug({packageJsonMissingDependenciesFromDeepJson})
  packageJsonMissingDependenciesFromDeepJson.forEach((dependency) => {
    packageJson.dependencies = {...packageJson.dependencies, [dependency.name]: `~${dependency.version}`};
  })
  debug({packageJsonDependenciesAfterAddingMissingDependencies: packageJson.dependencies})

  const syncDependenciesBasedOnDeepJsonResult = await syncDependenciesBasedOnDeepJson({
    deepJsonDependencies: deepJson.dependencies,
    packageJsonDependencies: packageJson.dependencies
  })
  debug({syncDependenciesBasedOnDeepJsonResult})
  deepJson.dependencies = syncDependenciesBasedOnDeepJsonResult.deepJsonDependencies
  packageJson.dependencies = syncDependenciesBasedOnDeepJsonResult.packageJsonDependencies
  debug({deepJsonDependenciesAfterMergingWithSyncDependenciesBasedOnDeepJsonResult: deepJson.dependencies});
  debug({packageJsonDependenciesAfterMergingWithSyncDependenciesBasedOnDeepJsonResult: packageJson.dependencies});
  const syncDependenciesBasedOnPackageJsonResult = await syncDependenciesBasedOnPackageJson({
    deepJsonDependencies: deepJson.dependencies,
    packageJsonDependencies: packageJson.dependencies
  })
  debug({syncDependenciesBasedOnPackageJsonResult})
  deepJson.dependencies = syncDependenciesBasedOnPackageJsonResult.deepJsonDependencies;
  packageJson.dependencies = syncDependenciesBasedOnPackageJsonResult.packageJsonDependencies;
  debug({deepJsonDependenciesAfterMergingWithSyncDependenciesBasedOnPackageJsonResult: deepJson.dependencies});
  debug({packageJsonDependenciesAfterMergingWithSyncDependenciesBasedOnPackageJsonResult: packageJson.dependencies});

  debug({resultDeepJsonDependencies: deepJson.dependencies})
  debug({resultPackageJsonDependencies: packageJson.dependencies})

  await writeFile(deepJsonFilePath, JSON.stringify(deepJson, null, 2));
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function syncDependenciesBasedOnDeepJson(param: {deepJsonDependencies: Exclude<Package['dependencies'], undefined>, packageJsonDependencies: Exclude<PackageJson['dependencies'], undefined>}) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependenciesBasedOnDeepJson'
  );
  debug({param})
  const {deepJsonDependencies, packageJsonDependencies} = param;
  let resultPackageJsonDependencies = {...packageJsonDependencies};
  debug({packageJsonDependencies: resultPackageJsonDependencies})
  let resultDeepJsonDependencies = [...deepJsonDependencies];
  debug({deepJsonDependencies: resultDeepJsonDependencies})
  deepJsonDependencies.forEach((dependency, index) => {
    debug({dependency, index})
    if(!dependency.version) {
      return;
    }
    const deepJsonDependencyVersionWithoutRange = semver.minVersion(dependency.version)?.version;
    debug({dependencyVersionWithoutRange: deepJsonDependencyVersionWithoutRange})
    if(!deepJsonDependencyVersionWithoutRange) {
      return
    };
    const packageJsonDependencyVersionWithoutRange = semver.minVersion(packageJsonDependencies![dependency.name])?.version;
    debug({packageJsonDependencyVersionWithoutRange})
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
  debug({result})
  return result
}

async function syncDependenciesBasedOnPackageJson(param: {deepJsonDependencies: Exclude<Package['dependencies'], undefined>, packageJsonDependencies: Exclude<PackageJson['dependencies'], undefined>}) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependenciesBasedOnPackageJson'
  );
  debug({param})
  const {deepJsonDependencies, packageJsonDependencies} = param;
  const resultPackageJsonDependencies = {...packageJsonDependencies};
  let resultDeepJsonDependencies = [...deepJsonDependencies];
  debug({deepJsonDependencies: resultDeepJsonDependencies})
  Object.entries(resultPackageJsonDependencies).forEach(([dependencyName, dependencyVersion]) => { 
    debug({dependencyName, dependencyVersion})
    const packageJsonDependencyVersionWithoutRange = semver.minVersion(dependencyVersion)?.version;
    debug({dependencyVersionWithoutRange: packageJsonDependencyVersionWithoutRange})
    if(!packageJsonDependencyVersionWithoutRange) {
      return
    };
    const deepJsonDependencyIndex = resultDeepJsonDependencies.findIndex(dependency => dependency.name === dependencyName);
    debug({deepJsonDependencyIndex})
    if(deepJsonDependencyIndex === -1) return;
    const deepJsonDependency = resultDeepJsonDependencies[deepJsonDependencyIndex];
    debug({deepJsonDependency})
    if(!deepJsonDependency.version) {
      return;
    }
    const deepJsonDependencyVersionWithoutRange = semver.minVersion(deepJsonDependency.version)?.version;
    debug({deepJsonDependencyVersionWithoutRange})
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
  debug({result})
  return result
}

async function getPackageJsonMissingDependenciesFromDeepJson(param: {deepJsonDependencies: Exclude<Package['dependencies'], undefined>, packageJsonDependencies: Exclude<PackageJson['dependencies'], undefined>}): Promise<Exclude<Package['dependencies'], undefined>> {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:getPackageJsonMissingDependenciesFromDeepJson'
  );
  const {deepJsonDependencies, packageJsonDependencies} = param;
  const missingDependenciesFromDeepJson: Package['dependencies'] = deepJsonDependencies.filter((dependency) => packageJsonDependencies[dependency.name] === undefined);
  debug({missingDependenciesFromDeepJson})
  return missingDependenciesFromDeepJson
}