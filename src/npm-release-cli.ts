import path from 'path';
import { program } from 'commander';
import { npmRelease } from './npm-release.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import  createLogger from 'debug';

npmReleaseCli();

async function npmReleaseCli() {
  const debug = createLogger(
    '@deep-foundation/npm-automation:npmReleaseCli'
  );

  const cliOptions = yargs(hideBin(process.argv))
    .command(`npm-release`, `Releases a package version`)
    .epilog(`Before releaseing deep.json version syncronizes with package.json version. Package will not be releaseed if there are newer version in npm`)
    .option('new-version', {
      demandOption: false,
      describe: 'New version to release',
      type: 'string'
    })
    .option(
      'package-json-file-path',
      {
        demandOption: false,
        describe: 'package.json file path',
        type: 'string'
      },
    )
    .option(
      'deep-json-file-path',
      {
        demandOption: false,
        describe: 'deep.json file path',
        type: 'string'
      },
    )
    .parseSync();

  debug({cliOptions})

  const currentDir = process.cwd();
  const {
    newVersion = 'patch',
    packageJsonFilePath = path.join(currentDir,'package.json'),
    deepJsonFilePath = path.join(currentDir,'deep.json'),
  } = cliOptions;

  await npmRelease({
    deepJsonFilePath,
    newVersion,
    packageJsonFilePath,
  });
}
