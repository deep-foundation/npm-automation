import fsExtra from 'fs-extra';

interface Dependency {
  name: string;
  version: string;
}

export interface CheckDependenciesParam {
  deepJsonFilePath: string;
  packageJsonPath: string;
}

export async function syncDependencies({
  deepJsonFilePath,
  packageJsonPath,
}: CheckDependenciesParam) {
  const deepJson = await fsExtra.readJson(deepJsonFilePath, 'utf8');
  const packageJson = await fsExtra.readJson(packageJsonPath, 'utf8');

  let updated = false;

  for (const dependency of deepJson.dependencies) {
    if (!packageJson.dependencies[dependency.name]) {
      const transformedDependency = {[dependency.name]: `~${dependency.version}`};
      packageJson.dependencies = {...packageJson.dependencies, ...transformedDependency};

      updated = true;
    }
  }

  if (updated) {
    await fsExtra.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with missing dependencies from deep.json');
  } else {
    console.log('No missing dependencies found');
  }
}
