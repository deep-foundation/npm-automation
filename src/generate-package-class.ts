import { Package } from '@deep-foundation/deeplinks/imports/packager';
import fsExtra from 'fs-extra';
import createDebugger from 'debug';

export async function generatePackageClass(param: GeneratePackageClassParam) {
  const debug = createDebugger('generatePackageClass');
  debug({param})
  const { deepJsonFilePath, outputFilePath, packageName } = param;
  const { default: deepJson }: { default: Package } = await import(deepJsonFilePath, {assert: {type: 'json'}});
  debug({deepJson})

  const ownedLinks = deepJson.data.filter(
    (link) => typeof link.id === 'string'
  );
  debug({ownedLinks})

    let idExamples: Array<string> = [];
    let IdLocalExamplesString: Array<string> = [];
    let entitiesString: Array<string> = [];

    for (const ownedLink of ownedLinks) {
      const idString = ownedLink.id.toString();
      const isType = idString[0] === idString[0].toUpperCase();
      const variableNameFirstPart = idString.charAt(0).toLowerCase() + idString.slice(1);
      const variableNameSecondPart = isType ? 'TypeLinkId' : 'LinkId';
      const variableName = `${variableNameFirstPart}${variableNameSecondPart}`;
      idExamples.push(`const ${variableName} = await package.${ownedLink.id}.id();`)
      IdLocalExamplesString.push(`const ${variableName} = package.${ownedLink.id}.idLocal();`)
      entitiesString.push(`
      /**
      @example
      #### Use id method to get the id of the link
      \`\`\`ts
      const package = new Package({deep});
      const ${variableName} = await package.${idString}.id();
      \`\`\`
      #### Use localId method to get the local id of the link
      \`\`\`ts
      const package = new Package({deep});
      const ${variableName} = await package.${idString}.localId();
      \`\`\`
      */
      public ${idString} = this.createEntity("${idString}");`)
    }



  let classDefinition = `
import {
  Package as BasePackage,
  PackageOptions as BasePackageOptions,
} from '@deep-foundation/deeplinks/imports/package';

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
${
  IdLocalExamplesString.join('\n').trimEnd()
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
debug({classDefinition})

  await fsExtra.writeFile(outputFilePath, classDefinition);
}

export interface GeneratePackageClassParam {
  deepJsonFilePath: string;
  outputFilePath: string;
  packageName: string;
}
