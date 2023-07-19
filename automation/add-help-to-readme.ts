import fs from 'fs';
import path from 'path';
import { execa } from 'execa';
import { glob } from 'glob';

main();

async function main() {
  // Find all the CLI utility files in the dist folder
  const cliUtilityFiles = await glob('./dist/*-cli.js', { absolute: true });

  // Read the existing README
  let readmeContent = fs.readFileSync('./README.md', { encoding: 'utf-8' });

  // Iterate over the CLI utilities
  for (const cliUtilityFile of cliUtilityFiles) {
    // Get the help message for the utility
    const { stdout: helpMessage } = await execa('node', [
      cliUtilityFile,
      '--help',
    ]);

    const cliUtilityFileName = path.basename(cliUtilityFile);
    const cliUtilityName = cliUtilityFileName.replace(/-cli.js$/, '');

    // Construct the placeholder for the utility
    const placeholder = `<!-- ${cliUtilityName
      .replace(/-/g, '_')
      .toUpperCase()}_HELP_PLACEHOLDER -->`;

    // Construct a RegExp for the full markdown section for the utility
    const markdownSectionRegExp = new RegExp(`(${placeholder}\n\`\`\`)(.*?)(\`\`\`)`, 'gs');

    // Replace the markdown section in the README with the updated help message
    readmeContent = readmeContent.replace(markdownSectionRegExp, `$1\n${helpMessage}\n$3`);

    // Replace the utility script file name with its command
    readmeContent = readmeContent.replace(
      new RegExp(cliUtilityFileName, 'g'),
      cliUtilityName
    );
  }

  // Write the updated README back to disk
  fs.writeFileSync('./README.md', readmeContent);
}
