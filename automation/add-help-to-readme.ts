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

  // This will hold all the help messages
  let allHelpMessages = "";

  // Iterate over the CLI utilities
  for (const cliUtilityFile of cliUtilityFiles) {
    // Get the help message for the utility
    const { stdout: helpMessage } = await execa('node', [
      cliUtilityFile,
      '--help',
    ]);

    const cliUtilityFileName = path.basename(cliUtilityFile);
    const cliUtilityName = cliUtilityFileName.replace(/-cli.js$/, '');

    // Add the help message to the total messages
    allHelpMessages += `
### \`${cliUtilityName}\`
\`\`\`
${helpMessage}
\`\`\`
`;
  }

  // Locate the start and end placeholders
  const startIdx = readmeContent.indexOf('<!-- CLI_HELP_START -->');
  const endIdx = readmeContent.indexOf('<!-- CLI_HELP_END -->');

  // Replace the content between the placeholders
  readmeContent = `${readmeContent.slice(0, startIdx + '<!-- CLI_HELP_START -->'.length)}\n${allHelpMessages}${readmeContent.slice(endIdx)}`;

  // Write the updated README back to disk
  fs.writeFileSync('./README.md', readmeContent);
}
