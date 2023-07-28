import { execa } from 'execa';
import fsExtra from 'fs-extra';
import {
  generateHelpOfCliAppsInMarkdownFormat,
  GenerateHelpOfCliAppsInMarkdownFormatOptions,
} from '@freephoenix888/generate-help-of-cli-apps-in-markdown-format';
import {
  generateUsageWaysOfNpmCliAppsInMarkdownFormat,
  GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions,
} from '@freephoenix888/generate-usage-ways-of-npm-cli-apps-in-markdown-format';
import {
  generateTableOfContentsForMarkdown,
  GenerateTableOfContentsForMarkdownOptions,
} from '@freephoenix888/generate-table-of-contents-for-markdown';
import createDebugMessages from 'debug'
import { ensureGitIsConfigured } from './ensure-git-is-configured.js';

export async function generateDocumentation(
  options: GenerateDocumentationOptions
) {
  await ensureGitIsConfigured();
  await updateReadme({ options });
  await generateTypescriptDocumentation();
}

async function updateReadme({
  options,
}: {
  options: GenerateDocumentationOptions;
}) {
  const debug = createDebugMessages('npm-automation:generateDocumentation:updateReadme')
  debug({options})
  if (
    options.generateCliAppsHelpInReadmeOptions ||
    options.generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions ||
    options.generateTableOfContentsForMarkdownOptions
  ) {
    const readmeFilePath = 'README.md';
    debug({readmeFilePath})
    let readmeContents = await fsExtra.readFile(readmeFilePath, 'utf8');
    let newReadmeContents = readmeContents;
    debug({readmeContents})
    if (options.generateCliAppsHelpInReadmeOptions) {
      const helpOfCliAppsInMarkdownFormat =
        await generateHelpOfCliAppsInMarkdownFormat(
          options.generateCliAppsHelpInReadmeOptions
        );
      debug({helpOfCliAppsInMarkdownFormat})
      const readmeContentWithHelpOfCliAppsInMarkdownFormat = await replacePlaceholder({
        content: readmeContents,
        placeholder: 'CLI_HELP',
        replacement: helpOfCliAppsInMarkdownFormat
      })
      debug({readmeContentWithHelpOfCliAppsInMarkdownFormat})
      newReadmeContents = readmeContentWithHelpOfCliAppsInMarkdownFormat;
    }
    if (options.generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions) {
      const usageWaysOfNpmCliAppsInMarkdownFormat =
        await generateUsageWaysOfNpmCliAppsInMarkdownFormat(
          options.generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions
        );
      debug({usageWaysOfNpmCliAppsInMarkdownFormat})
      const redmiContentWithUsageWaysOfNpmCliAppsInMarkdownFormat = await replacePlaceholder({
        content: readmeContents,
        placeholder: 'CLI_USAGE_WAYS',
        replacement: usageWaysOfNpmCliAppsInMarkdownFormat
      });
      debug({redmiContentWithUsageWaysOfNpmCliAppsInMarkdownFormat})
      newReadmeContents = redmiContentWithUsageWaysOfNpmCliAppsInMarkdownFormat;
    }
    if (options.generateTableOfContentsForMarkdownOptions) {
      const tableOfContents = await generateTableOfContentsForMarkdown(
        options.generateTableOfContentsForMarkdownOptions
      );
      debug({tableOfContents})
      const readmeContentWithTableOfContents = await replacePlaceholder({
        content: readmeContents,
        placeholder: 'TABLE_OF_CONTENTS',
        replacement: tableOfContents
      });
      debug({readmeContentWithTableOfContents})
      newReadmeContents = readmeContentWithTableOfContents;
    }
    await fsExtra.writeFile(readmeFilePath, newReadmeContents);
    const gitAddExecResult = await execa(`git`, ['add', readmeFilePath]);
    debug({gitAddExecResult})
    const gitStatusExecResult = await execa(`git`, ['status']);
    debug({gitStatusExecResult})
    const execResultAfterReadmeUpdate = await execa(
      'git',
      ['diff', '--staged', '--quiet'],
      { reject: false,   } 
    );
    debug({execResultAfterReadmeUpdate})
    if (execResultAfterReadmeUpdate.exitCode === 0) {
      console.log('No changes to commit');
    } else {
      await execa('git', ['commit', '-m', 'Update README.md'], {
        
      });
      await execa('git', ['push', 'origin', 'main'], {
        
      });
    }
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
  generateCliAppsHelpInReadmeOptions?: GenerateHelpOfCliAppsInMarkdownFormatOptions & {
    placeholder?: string;
  };
  generateUsageWaysOfNpmCliAppsInMarkdownFormatOptions?: GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions & {
    placeholder?: string;
  };
  generateTableOfContentsForMarkdownOptions?: GenerateTableOfContentsForMarkdownOptions & {
    placeholder?: string;
  };
};
