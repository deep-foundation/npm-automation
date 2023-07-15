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
/**
 * Represents a deep package
 * 
 * @remarks
 * Contains name of the package and all the links as the objects with id method which returns the id of the link.
 * 
 * @example
\`\`\`ts
const package = nwe Package({deep});
const {name: packageName} = package;
const ${ownedLinks[0].id}LinkId = await package.${ownedLinks[0].id}.id();
\`\`\`
  */
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';

export class Package {
  private deep: DeepClient;
  /**
   * Name of the package
   */
  public name: string = '${packageName}';

  constructor(param: PackageConstructorParam) {
    this.deep = param.deep;
  }

  private createEntity(...names: string[]) {
    return {
      id: async () => {
        return await this.id(this.name, ...names);
      },
      idLocal: async () => {
        return await this.idLocal(this.name, ...names);
      },
    };
  }

  async id(...names: string[]) {
    return await this.deep.id(this.name, ...names);
  }

  async idLocal(...names: string[]) {
    return this.deep.idLocal(this.name, ...names);
  }

${ownedLinks
.map(({ id }) => `
  /**
   * @example
\`\`\`ts
const package = new Package({deep});
const ${id}LinkId = await package.${id}.id();
\`\`\`
    */
  public ${id} = this.createEntity("${id}");`)
.join('')}

}

export interface PackageConstructorParam {
  deep: DeepClient;
}
`;
debug({classDefinition})

  await fsExtra.writeFile(outputFilePath, classDefinition);
}

export interface GeneratePackageClassParam {
  deepJsonFilePath: string;
  outputFilePath: string;
  packageName: string;
}
