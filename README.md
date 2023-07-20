[![npm](https://img.shields.io/npm/v/@deep-foundation/npm-automation.svg)](https://www.npmjs.com/package/@deep-foundation/npm-automation)
[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/npm-automation) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

Automates actions that you do in your deep package when you use npm

**[Documentaiton]**

# Using
## Library
See [Documentation] for examples and API

<!-- Do not remove these comments. They are used for automated generation -->
<!-- CLI_HELP_START -->
## Cli Usage

### `npm-sync-dependencies`
```
npm-sync-dependencies [Options]

Syncronizes deep.json and package.json dependencies

Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --deep-json-file-path     deep.json file path                         [string]
  --package-json-file-path  package.json file path                      [string]
```

### `npm-release`
```
npm-release [Options]

Releases a package version. Before releaseing deep.json version syncronizes with
 package.json version. Package will not be releaseed if there are newer version
in npm

Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --new-version             New version to release                      [string]
  --package-json-file-path  package.json file path                      [string]
  --deep-json-file-path     deep.json file path                         [string]
```

### `npm-pull`
```
npm-pull [Options]

Pulls latest version of a package from npm. Before pulling, if there are unstage
d changes, it throws an error that tells you to stash (git stash) or commit (git
 commit) your changes

Options:
  --help             Show help                                         [boolean]
  --version          Show version number                               [boolean]
  --package-name     Package name                                       [string]
  --package-version  Package version                                    [string]
```

### `npm-install`
```
npm-install [Options]

Installs a package and syncronizes deep.json and package.json dependencies

Options:
  --help                    Show help                                  [boolean]
  --version                 Version to install               [string] [required]
  --name                    Package name to install          [string] [required]
  --deep-json-file-path     deep.json file path                         [string]
  --package-json-file-path  package.json file path                      [string]
```

### `generate-package-class`
```
generate-package-class [Options]

Generates a package class which extends Package class from `@deep-foundation/dee
plinks/imports/package` and have fields for each link in the package and each th
at field is an object with id method which returns the id of the link and idLoca
l method which returns the local id of the link.

Options:
  --help                 Show help                                     [boolean]
  --version              Show version number                           [boolean]
  --package-name         Package name                                   [string]
  --deep-json-file-path  Path to deep.json file                         [string]
  --output-file-path     Path to output file                            [string]
```
<!-- CLI_HELP_END -->

[Documentation]: https://deep-foundation.github.io/npm-automation/