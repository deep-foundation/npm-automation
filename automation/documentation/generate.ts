import { execa } from 'execa';
import fsExtra from 'fs-extra';
import { glob } from 'glob';

const generate = async () => {
  const { stdout: username } = await execa('git', ['config', '--global', 'user.name']);
  if (!username) {
    await execa('git', ['config', '--global', 'user.name', 'FreePhoenix888'], {stdio: 'inherit'});
  }
  const { stdout: email } = await execa('git', ['config', '--global', 'user.email']);
  if (!email) {
    await execa('git', ['config', '--global', 'user.email', 'freephoenix888@gmail.com'], {stdio: 'inherit'});
  }

  const files = await glob('./dist/cli/*.js');
  const fileExecutePermissions = '755';
  for (const file of files) {
    await fsExtra.chmod(file, fileExecutePermissions);
  }

  let readmeContents = await fsExtra.readFile('README.md', 'utf8');

  const cliFilePaths = await glob('./dist/cli/*.js');
  const cliHelp = await execa('npx', ['--yes', '@freephoenix888/generate-help-of-cli-apps-in-markdown-format', '--cli-app-file-paths', ...cliFilePaths, '--root-header-level', '2']);
  readmeContents = readmeContents.replace(/(?<start><!-- CLI_HELP_START -->)[\S\s]*(?<end><!-- CLI_HELP_END -->)/g, `$<start>\n${cliHelp.stdout}\n$<end>`);

  const cliUsageWays = await execa('npx', ['--yes', '@freephoenix888/generate-usage-ways-of-npm-cli-apps-in-markdown-format', '--root-header-level', '2']);
  readmeContents = readmeContents.replace(/(?<start><!-- CLI_USAGE_WAYS_START -->)[\S\s]*(?<end><!-- CLI_USAGE_WAYS_END -->)/g, `$<start>\n${cliUsageWays.stdout}\n$<end>`);

  const { stdout: tableOfContents } = await execa('markdown-toc', ['README.md'], {stdio: 'inherit'});
  readmeContents = readmeContents.replace(/(?<start><!-- TABLE_OF_CONTENTS_START -->)[\S\s]*(?<end><!-- TABLE_OF_CONTENTS_END -->)/g, `$<start>\n${tableOfContents}\n$<end>`);

  await fsExtra.writeFile('README.md', readmeContents);

  await execa('npx', ['--yes', 'typedoc', './src/main.ts'], {stdio: 'inherit'});
  await execa(`git`, ['add', './docs'], {stdio: 'inherit'});
  const { exitCode } = await execa('git', ['diff', '--staged', '--quiet'], { reject: false , stdio: 'inherit'});
  if (exitCode === 0) {
    console.log("No changes to commit");
  }
  else {
    await execa('git', ['commit', '-m', 'Generate documentation'], {stdio: 'inherit'});
    await execa('git', ['push', 'origin', 'gh-pages'], {stdio: 'inherit'});
  }

};

generate();
