
import { writeFile } from 'fs/promises';
import { DeepJson, DeepJsonDependency } from './deep-json.js';
import semver from 'semver'
import { type PackageJson } from 'types-package-json';
import createDebugMessages from 'debug';

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
  const {default: deepJson}: {default: DeepJson} = await import(deepJsonFilePath, {assert: {type: 'json'}}) ;
  debug({deepJson})
  const {default: packageJson}: {default: Partial<PackageJson>} = await import(packageJsonPath, {assert: {type: 'json'}});
  debug({packageJson})

  if(!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  const packageJsonMissingDependenciesFromDeepJson: Array<DeepJsonDependency> = await getPackageJsonMissingDependenciesFromDeepJson({
    deepJson,
    packageJson
  });
  debug({packageJsonMissingDependenciesFromDeepJson})
  packageJsonMissingDependenciesFromDeepJson.forEach((dependency: DeepJsonDependency) => {
    packageJson.dependencies = {...packageJson.dependencies, [dependency.name]: `~${dependency.version}`};
  })

  if (packageJsonMissingDependenciesFromDeepJson.length > 0) {
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${packageJsonMissingDependenciesFromDeepJson.map((dependency: DeepJsonDependency) => dependency.name).join(', ')} are added to package.json because they exist in deep.json`);
  }

  const syncDependenciesBasedOnDeepJsonResult = await syncDependenciesBasedOnDeepJson({
    deepJson,
    packageJson
  })
  
  const syncDependenciesBasedOnPackageJsonResult = await syncDependenciesBasedOnPackageJson({
    deepJson,
    packageJson
  })

  deepJson.dependencies = {...syncDependenciesBasedOnDeepJsonResult.deepJsonDependencies, ...syncDependenciesBasedOnPackageJsonResult.deepJsonDependencies};
  debug({deepJsonDependencies: deepJson.dependencies})
  packageJson.dependencies = {...syncDependenciesBasedOnDeepJsonResult.packageJsonDependencies, ...syncDependenciesBasedOnPackageJsonResult.packageJsonDependencies};
  debug({packageJsonDependencies: packageJson.dependencies})
}

async function syncDependenciesBasedOnDeepJson(param: {deepJson: DeepJson, packageJson: Partial<PackageJson>}) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependenciesBasedOnDeepJson'
  );
  debug({param})
  const {deepJson, packageJson} = param;
  let packageJsonDependencies = packageJson.dependencies!;
  debug({packageJsonDependencies})
  let deepJsonDependencies = deepJson.dependencies;
  debug({deepJsonDependencies})
  deepJson.dependencies.forEach((dependency: DeepJsonDependency) => {
    const deepJsonDependencyVersionWithoutRange = semver.minVersion(dependency.version)?.version;
    debug({dependencyVersionWithoutRange: deepJsonDependencyVersionWithoutRange})
    if(!deepJsonDependencyVersionWithoutRange) {
      return
    };
    const packageJsonDependencyVersionWithoutRange = semver.minVersion(packageJson.dependencies![dependency.name])?.version;
    debug({packageJsonDependencyVersionWithoutRange})
    if(!packageJsonDependencyVersionWithoutRange) {
      return
    };
    const isDeepJsonVersionGreater = semver.gt(deepJsonDependencyVersionWithoutRange, packageJsonDependencyVersionWithoutRange);
    if(isDeepJsonVersionGreater) {
      packageJsonDependencies![dependency.name] = `~${deepJsonDependencyVersionWithoutRange}`;
    } else {
      deepJsonDependencies = {...deepJson.dependencies, [dependency.name]: `${deepJsonDependencyVersionWithoutRange}`};
    }
  })
  const result = {packageJsonDependencies, deepJsonDependencies};
  debug({result})
  return result
}

async function syncDependenciesBasedOnPackageJson(param: {deepJson: DeepJson, packageJson: Partial<PackageJson>}) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:syncDependenciesBasedOnDeepJson'
  );
  debug({param})
  const {deepJson, packageJson} = param;
  let packageJsonDependencies = packageJson.dependencies!;
  debug({packageJsonDependencies})
  let deepJsonDependencies = deepJson.dependencies;
  debug({deepJsonDependencies})
  Object.entries(packageJsonDependencies).forEach(([dependencyName, dependencyVersion]) => { 
    const packageJsonDependencyVersionWithoutRange = semver.minVersion(dependencyVersion)?.version;
    debug({dependencyVersionWithoutRange: packageJsonDependencyVersionWithoutRange})
    if(!packageJsonDependencyVersionWithoutRange) {
      return
    };
    const deepJsonDependency = deepJsonDependencies.find(dependency => dependency.name === dependency.name);
    if(!deepJsonDependency) return;
    const deepJsonDependencyVersionWithoutRange = semver.minVersion(deepJsonDependency.version)?.version;
    debug({deepJsonDependencyVersionWithoutRange})
    if(!deepJsonDependencyVersionWithoutRange) {
      return
    };
    const isPackageJsonVersionGreater = semver.gt(packageJsonDependencyVersionWithoutRange, deepJsonDependencyVersionWithoutRange);
    if(isPackageJsonVersionGreater) {
      deepJsonDependencies = {...deepJsonDependencies, [dependencyName]: `${packageJsonDependencyVersionWithoutRange}`};
    } else {
      packageJsonDependencies![dependencyName] = `~${deepJsonDependencyVersionWithoutRange}`;
    }
  })
  const result = {packageJsonDependencies, deepJsonDependencies};
  debug({result})
  return result
}

async function getPackageJsonMissingDependenciesFromDeepJson(param: {deepJson: DeepJson, packageJson: Partial<PackageJson>}) {
  const debug = createDebugMessages(
    '@deep-foundation/npm-automation:getPackageJsonMissingDependenciesFromDeepJson'
  );
  const {deepJson, packageJson} = param;
  const missingDependenciesFromDeepJson: Array<DeepJsonDependency> = deepJson.dependencies.filter((dependency: DeepJsonDependency) => packageJson.dependencies![dependency.name] === undefined);
  debug({missingDependenciesFromDeepJson})
  return missingDependenciesFromDeepJson
}