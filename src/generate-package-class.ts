import { Package } from '@deep-foundation/deeplinks/imports/packager';
import fsExtra from 'fs-extra';
import createDebugger from 'debug';

const moduleLog = createDebugger('generate-package-class');

/**
Generates a package class which extends Package class from `@deep-foundation/deeplinks/imports/package` and have fields for each link in the package and each that field is an object with id method which returns the id of the link and idLocal method which returns the local id of the link.
 */
export async function generatePackageClass(options: GeneratePackageClassOptions) {
  const log = moduleLog.extend(generatePackageClass.name);
  log({options: options})
  const { deepJsonFilePath = 'deep.json', outputFilePath, packageName } = options;
  log({deepJsonFilePath, outputFilePath, packageName})
  const deepJson: Package = await fsExtra.readJson(deepJsonFilePath).catch(error => {
    if(!options.deepJsonFilePath) {
      throw new Error(`Either deepJsonFilePath should be provided or there should be a deep.json file in the current directory. Error: ${error.message}`)
    }
    throw error;
  }) ;
  log({deepJson})

  const ownedLinks = deepJson.data.filter(
    (link) => typeof link.id === 'string'
  );
  log({ownedLinks})

    let idExamples: Array<string> = [];
    let IdLocalExamplesString: Array<string> = [];
    let entitiesString: Array<string> = [];
    let nameExamplesString: Array<string> = [];

    for (const ownedLink of ownedLinks) {
      const idString = ownedLink.id.toString();
      log({idString})
      const isType = idString[0] === idString[0].toUpperCase();
      log({isType})
      const linkIdVariableNameFirstPart = idString.charAt(0).toLowerCase() + idString.slice(1);
      log({linkIdVariableNameFirstPart})
      const linkIdVariableNameSecondPart = isType ? 'TypeLinkId' : 'LinkId';
      log({linkIdVariableNameSecondPart})
      const linkIdVariableName = `${linkIdVariableNameFirstPart}${linkIdVariableNameSecondPart}`;
      log({linkIdVariableName})
      idExamples.push(`const ${linkIdVariableName} = await package["${ownedLink.id}"].id();`)
      IdLocalExamplesString.push(`const ${linkIdVariableName} = package["${ownedLink.id}"].idLocal();`)
      const linkNameVariableName = idString[0].toLowerCase() + idString.slice(1);
      log({linkNameVariableName})
      nameExamplesString.push(`const ${linkNameVariableName} = package["${ownedLink.id}"].name;`)
      entitiesString.push(`
      /**
      @example
      #### Use id method to get the id of the ${idString} link
      \`\`\`ts
      const package = new Package({deep});
      const ${linkIdVariableName} = await package["${idString}"].id();
      \`\`\`
      #### Use localId method to get the local id of the ${idString} link
      \`\`\`ts
      const package = new Package({deep});
      const ${linkIdVariableName} = await package["${idString}"].localId();
      \`\`\`
      #### Use name field to get the name of the ${idString} link
      \`\`\`ts
      const package = new Package({deep});
      const ${linkNameVariableName} = await package["${idString}"].name;
      \`\`\`
      */
      public "${idString}" = this.createEntity("${idString}");`)
    }
    log({idExamples, IdLocalExamplesString, entitiesString, nameExamplesString})



  let classDefinition = `
import {
  Package as BasePackage,
  PackageOptions as BasePackageOptions,
} from '@deep-foundation/deeplinks/imports/package.js';

/**
Represents a deep package

@remarks
Contains name of the package and all the links as the objects with id method which returns the id of the link.

@example
#### Use name field to get the name of the package
\`\`\`ts
const package = new Package({deep});
const {name: packageName} = package;
\`\`\`
#### Use id method to get the id of the link
\`\`\`ts
const package = new Package({deep});
${
  idExamples.join('\n').trimEnd()
}
\`\`\`

#### Use idLocal method to get the local id of the link
\`\`\`ts
const package = new Package({deep});
await package.applyMinilinks();
${
  IdLocalExamplesString.join('\n').trimEnd()
}
\`\`\`
#### Use name field to get the name of the link
\`\`\`ts
const package = new Package({deep});
${
  nameExamplesString.join('\n').trimEnd()
}
\`\`\`
*/
export class Package extends BasePackage {

  constructor(param: PackageOptions) {
    super({
      ...param,
      name: '${packageName}',
    });
  }

${entitiesString.join('')}

}

export type PackageOptions = Omit<BasePackageOptions, 'name'>;
`;
log({classDefinition})

  if(outputFilePath) {
    await fsExtra.writeFile(outputFilePath, classDefinition);
    log(`Wrote class definition to ${outputFilePath}`)
  }
  return classDefinition;
}

export interface GeneratePackageClassOptions {
  deepJsonFilePath?: string;
  outputFilePath?: string;
  packageName: string;
}
