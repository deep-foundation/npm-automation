import path from 'path';
import exec from '@simplyhexagonal/exec';
import { program } from 'commander';
import fs from 'fs';

main();

async function main() {
  program
    .name('npm-publish')
    .description('Publish a package to npm')
    .addHelpText(
      'after',
      `
   
   Before publishing deep.json version syncronizes with package.json version. Package will not be published if there are newer version in npm`
    );

  program
    .option('--new-version <new_version>', 'New version to publish')
    .option(
      '--package-json-file-path <package_json_file_path>',
      'package.json file path'
    )
    .option(
      '--deep-json-file-path <deep_json_file_path>',
      'deep.json file path'
    );

  program.parse(process.argv);

  const {
    newVersion = 'patch',
    packageJsonPath = path.resolve('package.json'),
    deepJsonFilePath = path.resolve('deep.json'),
  } = program.opts();

  const packageJson = await import(packageJsonPath);
  const { execPromise } = exec(`npm view ${packageJson.name} version`);
  const execResult = await execPromise;
  if (execResult.exitCode !== 0) {
    throw new Error(execResult.stderrOutput.trim());
  }
  const npmLatestPackageJsonVersion = execResult.stdoutOutput.toString().trim();
  const packageJsonVersion = packageJson.version;
  if (npmLatestPackageJsonVersion > packageJsonVersion) {
    throw new Error(
      `Version ${packageJson.version} in ${packageJsonPath} is outdated. Latest version in npm is ${npmLatestPackageJsonVersion}. Execute npm-pull`
    );
  }
  if (npmLatestPackageJsonVersion === packageJsonVersion) {
    await execWrapped({
      command: `npm version --allow-same-version ${newVersion}`,
    });
    await updateDeepJsonVersion({
      version: newVersion,
      filePath: deepJsonFilePath,
    });
  }
  if (npmLatestPackageJsonVersion < packageJsonVersion) {
    await execWrapped({ command: `npm version ${packageJsonVersion}` });
    await updateDeepJsonVersion({
      version: newVersion,
      filePath: deepJsonFilePath,
    });
  }
}

async function updateDeepJsonVersion({
  version,
  filePath,
}: {
  version: string;
  filePath: string;
}) {
  const deepPackage = await import(filePath);
  deepPackage.package.version = version;

  fs.writeFileSync(filePath, JSON.stringify(deepPackage, null, 2), 'utf-8');
}

async function execWrapped({ command }: { command: string }) {
  const { execPromise, execProcess } = exec(command);
  const execResult = await execPromise;
  if (execResult.exitCode !== 0) {
    throw new Error(execResult.stderrOutput);
  }
  console.log(execResult.stdoutOutput);
  return { execProcess, execPromise, execResult };
}