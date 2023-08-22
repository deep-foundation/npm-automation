import { execa } from "execa";
import createDebugMessages from "debug";

export async function ensureGitIsConfigured() {
  const log = createDebugMessages(`npm-automation:generateDocumentation:${ensureGitIsConfigured}`)
  const { stdout: username } = await execa(
    'git',
    ['config', '--global', 'user.name'],
    { reject: false }
  );
  log({username})
  if (!username) {
    throw new Error(
      `Please set your git username using the command: git config --global user.name "Your Name"`
    );
  }
  const { stdout: email } = await execa(
    'git',
    ['config', '--global', 'user.email'],
    { reject: false }
  );
  log({email})
  if (!email) {
    throw new Error(
      `Please set your git email using the command: git config --global user.email "Your email"`
    );
  }
}