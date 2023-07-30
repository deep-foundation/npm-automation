import { execa } from 'execa';
import fsExtra from 'fs-extra';
import {
  generateHelpOfCliAppsInMarkdownFormat,
  GenerateHelpOfCliAppsInMarkdownFormatOptions,
} from '@freephoenix888/generate-help-of-cli-apps-in-markdown-format/dist/main.js';
import {
  generateUsageWaysOfNpmCliAppsInMarkdownFormat,
  GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions,
} from '@freephoenix888/generate-usage-ways-of-npm-cli-apps-in-markdown-format/dist/main.js';
import {
  generateTableOfContentsForMarkdown,
  GenerateTableOfContentsForMarkdownOptions,
} from '@freephoenix888/generate-table-of-contents-for-markdown/dist/main.js';
import createDebugMessages from 'debug'
import { ensureGitIsConfigured } from './ensure-git-is-configured.js';
import { glob } from 'glob';

export async function generateDocumentation(
  options: GenerateDocumentationOptions
) {
  await ensureGitIsConfigured();
  await updateReadmeIfNeeded({ options });
  await generateTypescriptDocumentation();
}

async function updateReadmeIfNeeded({
  options,
}: {
  options: GenerateDocumentationOptions;
}) {
  const debug = createDebugMessages('npm-automation:generateDocumentation:updateReadme')
  debug({options})
  const readmeFilePath = options.readmeFilePath ?? './README.md';
  if (options.generateCliAppsHelpInReadmeOptions !== null) {
    const {generateCliAppsHelpInReadmeOptions = {
      cliAppFilePaths: await glob(`./dist/cli/*.js`, {absolute: true}),
      output: {
        writeMode: 'replace-placeholder',
        placeholder: {
          start: `<!-- CLI_HELP_START -->`,
          end: `<!-- CLI_HELP_END -->`,
        },
        filePath: readmeFilePath
      }
    }} = options;
    const helpOfCliAppsInMarkdownFormat = await generateHelpOfCliAppsInMarkdownFormat(generateCliAppsHelpInReadmeOptions);
    debug({helpOfCliAppsInMarkdownFormat})
  }
  if (options.generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions !== null) {
    const {generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions = {
      cliUtilityNames: await glob(`./dist/cli/*.js`, {absolute: true}).then(cliAppFilePaths => cliAppFilePaths.map(cliAppFilePath => cliAppFilePath.replace(/\.js$/, ''))),
      output: {
        writeMode: 'replace-placeholder',
        placeholder: {
          start: `<!-- CLI_USAGE_WAYS_START -->`,
          end: `<!-- CLI_USAGE_WAYS_END -->`,
        },
        filePath: readmeFilePath
      }
    }} = options;
    const usageWaysOfNpmCliAppsInMarkdownFormat = await generateUsageWaysOfNpmCliAppsInMarkdownFormat(generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions);
    debug({usageWaysOfNpmCliAppsInMarkdownFormat})
  }
  if (options.generateTableOfContentsForMarkdownOptions!==null) {
    const {generateTableOfContentsForMarkdownOptions = {
      markdownFilePath: readmeFilePath,
      output: {
        writeMode: 'replace-placeholder',
        placeholder: {
          start: `<!-- TABLE_OF_CONTENTS_START -->`,
          end: `<!-- TABLE_OF_CONTENTS_END -->`,
        },
        filePath: readmeFilePath
      }
    }} = options;
    const tableOfContents = await generateTableOfContentsForMarkdown(generateTableOfContentsForMarkdownOptions);
    debug({tableOfContents})
  }
  const gitAddExecResult = await execa(`git`, ['add', readmeFilePath]);
  debug({gitAddExecResult})
  const execResultAfterReadmeUpdate = await execa(
    'git',
    ['diff', '--staged', '--quiet'],
    { reject: false,   } 
  );
  debug({execResultAfterReadmeUpdate})
  if (execResultAfterReadmeUpdate.exitCode === 0) {
    console.log('No changes to commit');
  } else {
    await execa('git', ['commit', '-m', 'Update README.md']);
    await execa('git', ['push', 'origin', 'main']);
  }
}

async function generateTypescriptDocumentation() {
  const debug = createDebugMessages('npm-automation:generateDocumentation:generateTypescriptDocumentation')
  // Generate the docs first
  await execa('npx', ['typedoc', './src/main.ts'], {
    
  });

  // Stage and commit the docs in the main branch
  await execa('git', ['add', 'docs'], {   });
  await execa('git', ['commit', '-m', 'Update documentation'], {
    
  });

  await execa('git', ['fetch'], {  });
  // Check if the gh-pages branch exists
  const { stdout: ghPagesBranchExists } = await execa(
    'git',
    ['branch', '-r', '--list', 'origin/gh-pages'],
    { reject: false,   }
  );
  debug({ghPagesBranchExists})

  if (!ghPagesBranchExists) {
    // If it doesn't exist, create it as an orphan branch
    await execa('git', ['checkout', '--orphan', 'gh-pages'], {
      
    });
  } else {
    // If it does exist, just checkout to it
    await execa('git', ['checkout', 'gh-pages'], {
      
    });
  }

  // Checkout the docs from the main branch to the gh-pages branch
  await execa('git', ['checkout', 'main', '--', 'docs'], {
    
  });

  // Commit and push the changes
  await execa('git', ['commit', '-m', 'Update documentation'], {
    
  });
  await execa('git', ['push', 'origin', 'gh-pages'], {
    
  });

  // Switch back to the main branch
  await execa('git', ['checkout', 'main'], {   });
}

async function replacePlaceholder({content, placeholder, replacement}: {content: string, placeholder: string, replacement: string}) {
  const debug = createDebugMessages('npm-automation:generateDocumentation:replacePlaceholder')
  const placeholderStart = `<!-- ${placeholder}_START -->`;
  debug({placeholderStart})
  const placeholderEnd = `<!-- ${placeholder}_END -->`;
  debug({placeholderEnd})
  const pattern = new RegExp(`(?<start>${placeholderStart})[\\S\\s]*(?<end>${placeholderEnd})`, 'g');
  debug({pattern})
  const newContent = content.replace(
    pattern,
    `$<start>\n${replacement}\n$<end>`
  )
  debug({newContent})
  return newContent
}

export type GenerateDocumentationOptions = {
  generateCliAppsHelpInReadmeOptions?: undefined|null|(GenerateHelpOfCliAppsInMarkdownFormatOptions & {
    placeholder?: string;
  });
  generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions?: undefined|null|(GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions & {
    placeholder?: string;
  });
  generateTableOfContentsForMarkdownOptions?: undefined|null|(GenerateTableOfContentsForMarkdownOptions & {
    placeholder?: string;
  });
  readmeFilePath?: string;
};
