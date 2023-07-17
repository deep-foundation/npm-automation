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
  let classDefinition = `
import {
  Package as BasePackage,
  PackageConstructorParam as BasePackageConstructorParam,
} from '@deep-foundation/deeplinks/imports/package';

/**
 * Represents a deep package
 * 
 * @remarks
 * Contains name of the package and all the links as the objects with id method which returns the id of the link.
 * 
 * @example
 * #### Use name field to get the name of the package
\`\`\`ts
const package = new Package({deep});
const {name: packageName} = package;
\`\`\`
 * #### Use id method to get the id of the link
\`\`\`ts
const package = new Package({deep});
${
  ownedLinks.map(({ id }) => `\nconst ${id}LinkId = await package.${id}.id();`).join('')
}
\`\`\`
  *
  * #### Use idLocal method to get the local id of the link
\`\`\`ts
const package = new Package({deep});
${
  ownedLinks.map(({ id }) => `
const ${id}LinkId = package.${id}.idLocal();
`).join('')
}
\`\`\`
  */

export class Package extends BasePackage {

  constructor(param: PackageConstructorParam) {
    super({
      ...param,
      name: 'Device',
    });
  }

${ownedLinks
.map(({ id }) => `
  /**
   * @example
   * #### Use id method to get the id of the link
\`\`\`ts
const package = new Package({deep});
const ${id}LinkId = await package.${id}.id();
\`\`\`
    * #### Use localId method to get the local id of the link
\`\`\`ts
const package = new Package({deep});
const ${id}LinkId = await package.${id}.localId();
\`\`\`
    */
  public ${id} = this.createEntity("${id}");`)
.join('')}

}

export type PackageConstructorParam = Omit<BasePackageConstructorParam, 'name'>;
`;
debug({classDefinition})

  await fsExtra.writeFile(outputFilePath, classDefinition);
}

export interface GeneratePackageClassParam {
  deepJsonFilePath: string;
  outputFilePath: string;
  packageName: string;
}
