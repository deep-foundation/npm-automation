import { glob } from 'glob';
import {generateDocumentation} from '../../src/generate-documentation.js'
import path from 'path';

main();

async function main() {
  const cliAppFilePaths = await glob(`./dist/cli/*.js`, {absolute: true})
  await generateDocumentation({
    generateCliAppsHelpInReadmeOptions: {
      cliAppFilePaths: cliAppFilePaths,
      rootHeaderLevel: 2
    },
    generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions: {
      cliUtilityNames: cliAppFilePaths.map(cliAppFilePath => path.basename(cliAppFilePath, '.js')),
    },
    generateTableOfContentsForMarkdownOptions: {
      markdownFilePath: './README.md',
    } 
  })
};