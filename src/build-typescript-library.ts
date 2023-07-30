import { execa } from 'execa';
import { ensureGitIsConfigured } from './ensure-git-is-configured.js';
import {
  GeneratePackageClassOptions,
  generatePackageClass,
} from './generate-package-class.js';
import fsExtra from 'fs-extra'

export async function buildTypescriptLibrary(
  options: BuildTypescriptLibraryOptions
) {
  await ensureGitIsConfigured();
  if (options.generatePackageClassOptions !== null) {
    const { generatePackageClassOptions } = options;
    const outputFilePath = generatePackageClassOptions?.outputFilePath ?? './src/package.ts';
    const deepJsonFilePath = generatePackageClassOptions?.deepJsonFilePath ?? './deep.json';
    const packageName = generatePackageClassOptions?.packageName ?? await fsExtra.readJson('./package.json').then(packageJson => packageJson.name).catch((error) => {
      throw new Error(`Either specify packageName in generatePackageClassOptions or ensure that package.json exists in the current working directory. Error: ${error}`)
    });
    await generatePackageClass({
      packageName,
      deepJsonFilePath,
      outputFilePath
    });
    // git add
    await execa('git', ['add', outputFilePath]);

    const { exitCode } = await execa('git', ['diff', '--staged', '--quiet'], {
      reject: false,
    });

    if (exitCode === 0) {
      console.log('No changes to commit');
    } else {
      await execa('git', ['commit', '-m', 'Generate new package class']);
      await execa('git', ['push', 'origin', 'main']);
    }
  }

  await execa('tsc');
}

export interface BuildTypescriptLibraryOptions {
  generatePackageClassOptions?: GeneratePackageClassOptions|undefined|null;
}
