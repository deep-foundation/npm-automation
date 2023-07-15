import { Package } from '@deep-foundation/deeplinks/imports/packager';
import fsExtra from 'fs-extra';
import createDebugger from 'debug';

export async function generatePackageClass(param: GeneratePackageClassParam) {
  const debug = createDebugger('generatePackageClass');
  debug({param})
  const { deepJsonFilePath, outputFilePath, packageName } = param;
  const { default: deepJson }: { default: Package } = await fsExtra
    .readJson(deepJsonFilePath, { encoding: 'utf-8' })
    .catch(() => {
      throw new Error(`deep.json file does not exist in ${deepJsonFilePath}`);
    });
  debug({deepJson})

  const ownedLinks = deepJson.data.filter(
    (link) => typeof link.id === 'string'
  );
  debug({ownedLinks})
  let classDefinition = `
  import { DeepClient } from '@deep-foundation/deeplinks/imports/client';

  export class Package {
    private deep: DeepClient;
    public name: string = '${packageName}';

    constructor(deep: DeepClient) {
      this.deep = deep;
    }
  
    private createEntity(...names: string[]) {
      return {
        id: async () => {
          await this.id(this.name, ...names);
        },
      };
    }
  
    async id(...names: string[]) {
      await this.deep.id(this.name, ...names);
    }
${ownedLinks
  .map(({ id }) => `\n  public ${id} = this.createEntity("${id}");`)
  .join('')}

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
