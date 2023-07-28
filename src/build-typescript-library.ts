import { execa } from 'execa';
import { ensureGitIsConfigured } from './ensure-git-is-configured.js';
import {
  GeneratePackageClassOptions,
  generatePackageClass,
} from './generate-package-class.js';

export async function buildTypescriptLibrary(
  options: BuildTypescriptLibraryOptions
) {
  await ensureGitIsConfigured();
  if (options.generatePackageClassOptions) {
    const {outputFilePath = './src/package.ts'} = options.generatePackageClassOptions;
    await generatePackageClass({
      ...options.generatePackageClassOptions,
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
  generatePackageClassOptions?: GeneratePackageClassOptions;
}
