import fsExtra from 'fs-extra';

export interface CheckDependenciesParam {
  deepJsonFilePath: string;
  packageJsonPath: string;
}

type Dependency = Record<string, string>;

export async function syncDependencies({
  deepJsonFilePath,
  packageJsonPath,
}: CheckDependenciesParam) {
  const {default: deepJson} = await import(deepJsonFilePath, {assert: {type: 'json'}}) ;
  const {default: packageJson} = await import(packageJsonPath, {assert: {type: 'json'}});

  const missingDependenciesFromDeepJson: Array<Dependency> = deepJson.dependencies.filter((dependency: Dependency) => !!packageJson.dependencies[dependency.name]);
  missingDependenciesFromDeepJson.forEach((dependency: Dependency) => {
    const transformedDependency = {[dependency.name]: `~${dependency.version}`};
    packageJson.dependencies = {...packageJson.dependencies, ...transformedDependency};
  })

  if (missingDependenciesFromDeepJson.length > 0) {
    await fsExtra.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${missingDependenciesFromDeepJson.map((dependency: Dependency) => dependency.name).join(', ')} added to package.json because they exist in deep.json`);
  }
}
