import { generatePackageClass, GeneratePackageClassOptions } from '../src/generate-package-class';
import fs from 'fs-extra';
import mockFs from 'mock-fs';

// Jest provides a clearAllMocks function that can clean up all the manual mocks
afterEach(() => {
  jest.clearAllMocks();
  mockFs.restore();
});

describe('generatePackageClass', () => {
  beforeEach(() => {
    mockFs({
      'path/to/deepJson': JSON.stringify({
        default: {
          data: [
            { id: 'testId1' },
            { id: 'testId2' },
            { id: 12345 },
          ],
        },
      }),
    });
  });

  it('should throw an error if the deep.json file does not exist', async () => {
    const params: GeneratePackageClassOptions = {
      deepJsonFilePath: 'path/to/nonexistent/deepJson',
      outputFilePath: 'path/to/output',
      packageName: 'testPackage',
    };

    await expect(generatePackageClass(params)).rejects.toThrow(
      new Error(`deep.json file does not exist in ${params.deepJsonFilePath}`),
    );
  });

  it('should generate a package class and write it to the output file', async () => {
    const params: GeneratePackageClassOptions = {
      deepJsonFilePath: 'path/to/deepJson',
      outputFilePath: 'path/to/output',
      packageName: 'testPackage',
    };

    await generatePackageClass(params);

    const writtenClassDefinition = await fs.readFile(params.outputFilePath, 'utf-8');
    expect(writtenClassDefinition).toContain("public name: string = 'testPackage'");
    expect(writtenClassDefinition).toContain("public testId1 = this.createEntity(\"testId1\")");
    expect(writtenClassDefinition).toContain("public testId2 = this.createEntity(\"testId2\")");
    expect(writtenClassDefinition).not.toContain("public 12345 = this.createEntity(\"12345\")");
  });
});
