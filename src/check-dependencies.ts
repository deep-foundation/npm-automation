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
  const deepJson = JSON.parse(await fsExtra.readFile(deepJsonFilePath, 'utf8'));
  const packageJson = JSON.parse(await fsExtra.readFile(packageJsonPath, 'utf8'));

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
