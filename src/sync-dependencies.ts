import fsExtra from 'fs-extra';
import { DeepJson, DeepJsonDependency } from './deep-json.js';
import semver from 'semver'
import { type PackageJson } from 'types-package-json';


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
 * 
 */
export async function syncDependencies(param: SyncDependenciesParam) {
  const {
    deepJsonFilePath,
    packageJsonFilePath: packageJsonPath,
  } = param;
  const {default: deepJson}: {default: DeepJson} = await import(deepJsonFilePath, {assert: {type: 'json'}}) ;
  const {default: packageJson}: {default: Partial<PackageJson>} = await import(packageJsonPath, {assert: {type: 'json'}});

  if(!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  const missingDependenciesFromDeepJson: Array<DeepJsonDependency> = deepJson.dependencies.filter((dependency: DeepJsonDependency) => !!packageJson.dependencies![dependency.name]);
  missingDependenciesFromDeepJson.forEach((dependency: DeepJsonDependency) => {
    packageJson.dependencies = {...packageJson.dependencies, [dependency.name]: `~${dependency.version}`};
  })

  if (missingDependenciesFromDeepJson.length > 0) {
    await fsExtra.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${missingDependenciesFromDeepJson.map((dependency: DeepJsonDependency) => dependency.name).join(', ')} are added to package.json because they exist in deep.json`);
  }

  deepJson.dependencies.forEach((dependency: DeepJsonDependency) => {
    const isDeepJsonVersionGreater = semver.gt(dependency.version, packageJson.dependencies![dependency.name]);
    if(isDeepJsonVersionGreater) {
      packageJson.dependencies![dependency.name] = `~${dependency.version}`;
    } else {
      deepJson.dependencies = {...deepJson.dependencies, [dependency.name]: `${dependency.version}`};
    }
  })

  Object.entries(packageJson.dependencies).forEach(([dependencyName, dependencyVersion]) => { 
    const deepJsonDependency = deepJson.dependencies.find(dependency => dependency.name === dependency.name);
    if(!deepJsonDependency) return;
    const isPackageJsonVersionGreater = semver.gt(dependencyVersion, deepJson.dependencies.find(dependency => dependency.name === dependency.name)!.version);
    if(isPackageJsonVersionGreater) {
      deepJson.dependencies = {...deepJson.dependencies, [dependencyName]: `${dependencyVersion}`};
    } else {
      packageJson.dependencies![dependencyName] = `~${deepJsonDependency.version}`;
    }
  })
}
