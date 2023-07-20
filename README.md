[![npm](https://img.shields.io/npm/v/@deep-foundation/npm-automation.svg)](https://www.npmjs.com/package/@deep-foundation/npm-automation)
[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/npm-automation) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

Automates actions that you do in your deep package when you use npm

[**Documentaiton**](https://deep-foundation.github.io/npm-automation/)

## Prereqisitions
Install package
```
npm install --save-dev @deep-foundation/npm-automation
```
# Using
## Library
- [npm-pull](https://deep-foundation.github.io/npm-automation/functions/npmPull.html)
- [npm-release](https://deep-foundation.github.io/npm-automation/functions/npmRelease.html)
- [npm-install](https://deep-foundation.github.io/npm-automation/functions/npmInstall.html)
- [sync-dependencies](https://deep-foundation.github.io/npm-automation/functions/syncDependencies.html)
- [generate-package-class](https://deep-foundation.github.io/npm-automation/functions/generatePackageClass.html)

<!-- Do not remove these comments. They are used for automated generation -->
<!-- CLI_HELP_START -->
## Cli

### `npm-sync-dependencies`
```
Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --npm-sync-versions       Syncronizes deep.json and package.json dependencies
  --deep-json-file-path     deep.json file path                         [string]
  --package-json-file-path  package.json file path                      [string]
```

### `npm-release`
```
Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --npm-release             Releases a package version
  --new-version             New version to release                      [string]
  --package-json-file-path  package.json file path                      [string]
  --deep-json-file-path     deep.json file path                         [string]

Before releaseing deep.json version syncronizes with package.json version. Packa
ge will not be releaseed if there are newer version in npm
```

### `npm-pull`
```
Options:
  --help             Show help                                         [boolean]
  --version          Show version number                               [boolean]
  --npm-pull         Pulls latest version of a package from npm
  --package-name     Package name                                       [string]
  --package-version  Package version                                    [string]

Before pulling, if there are unstaged changes, it throws an error that tells you
 to stash (git stash) or commit (git commit) your changes.
```

### `npm-install`
```
Options:
  --help                    Show help                                  [boolean]
  --version                 Version to install               [string] [required]
  --npm-install             Installs a package and syncronizes deep.json and pac
                            kage.json dependencies
  --name                    Package name to install          [string] [required]
  --deep-json-file-path     deep.json file path                         [string]
  --package-json-file-path  package.json file path                      [string]
```

### `generate-package-class`
```
Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --generate-package-class  Generates a package class which extends Package clas
                            s from `@deep-foundation/deeplinks/imports/package`
                            and have fields for each link in the package and eac
                            h that field is an object with id method which retur
                            ns the id of the link and idLocal method which retur
                            ns the local id of the link.
  --package-name            Package name                                [string]
  --deep-json-file-path     Path to deep.json file                      [string]
  --output-file-path        Path to output file                         [string]
```
<!-- CLI_HELP_END -->