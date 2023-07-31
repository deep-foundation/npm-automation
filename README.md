[![npm](https://img.shields.io/npm/v/@deep-foundation/npm-automation.svg)](https://www.npmjs.com/package/@deep-foundation/npm-automation)
[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/npm-automation) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

Automates actions that you do in your deep package when you use npm

# Table Of Contents
<!-- TABLE_OF_CONTENTS_START -->
- [Table Of Contents](#table-of-contents)
- [Library](#library)
- [Cli](#cli)
  - [Cli Usage](#cli-usage)
    - [`npm-sync-dependencies`](#`npm-sync-dependencies`)
    - [`npm-release`](#`npm-release`)
    - [`npm-pull`](#`npm-pull`)
    - [`npm-install`](#`npm-install`)
    - [`generate-package-class`](#`generate-package-class`)
  - [Cli Usage Ways](#cli-usage-ways)
  - [Directly running using npx](#directly-running-using-npx)
  - [Global Installation](#global-installation)
    - [Global installation and running using binary name](#global-installation-and-running-using-binary-name)
    - [Global installation and running using npx](#global-installation-and-running-using-npx)
  - [Local installation](#local-installation)
    - [Local installation and running using npx](#local-installation-and-running-using-npx)
    - [Local installation and running using npm script](#local-installation-and-running-using-npm-script)

<!-- TABLE_OF_CONTENTS_END -->

# Library
See [Documentation] for examples and API

# Cli
## Cli Usage
<!-- CLI_HELP_START -->

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

## Cli Usage Ways
<!-- CLI_USAGE_WAYS_START -->
If you are going to use this package in a project - it is recommended to install it is [Locally](#local-installation)  
If you are going to use this package for yourself - it is recommended to install it [Globally](#global-installation) or run it directly using [npx](#directly-running-using-npx)
## Directly running using npx
```shell
npx --yes --package @deep-foundation/npm-automation npm-sync-dependencies
npx --yes --package @deep-foundation/npm-automation npm-release
npx --yes --package @deep-foundation/npm-automation npm-pull
npx --yes --package @deep-foundation/npm-automation npm-install
npx --yes --package @deep-foundation/npm-automation generate-package-class
```

## Global Installation
### Global installation and running using binary name
```shell
npm install --global @deep-foundation/npm-automation
npm-sync-dependencies
npm-release
npm-pull
npm-install
generate-package-class
```

### Global installation and running using npx
```shell
npm install --global @deep-foundation/npm-automation
npx npm-sync-dependencies
npx npm-release
npx npm-pull
npx npm-install
npx generate-package-class
```

## Local installation

### Local installation and running using npx
```shell
npm install @deep-foundation/npm-automation
npx npm-sync-dependencies
npx npm-release
npx npm-pull
npx npm-install
npx generate-package-class
```

### Local installation and running using npm script
```shell
npm install @deep-foundation/npm-automation
```
Add npm script to package.json. Note that you can name  your script as you want but it must call binary file provided by the package
```json
{
  "scripts": {
    "npm-sync-dependencies": "npm-sync-dependencies",
    "npm-release": "npm-release",
    "npm-pull": "npm-pull",
    "npm-install": "npm-install",
    "generate-package-class": "generate-package-class"
  }
}
```
and run
```shell
npm run npm-sync-dependencies
npm run npm-release
npm run npm-pull
npm run npm-install
npm run generate-package-class
```
<!-- CLI_USAGE_WAYS_END -->

[Documentation]: https://deep-foundation.github.io/npm-automation/
