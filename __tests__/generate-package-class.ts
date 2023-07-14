// Import the function and types from the module to be tested
import { generatePackageClass, GeneratePackageClassParam } from '../src/generate-package-class';
import fs from 'fs-extra'; // Import fs-extra for file operations
import mockFs from 'mock-fs'; // Import mock-fs to mock the file system

// Mock the 'fs-extra' module with 'mock-fs'
jest.mock('fs-extra', () => require('mock-fs'));

// We use 'describe' to group our tests
describe('generatePackageClass', () => {

  // Before each test, we setup a mock file system with 'mockFs'
  beforeEach(() => {
    mockFs({
      'path/to/deepJson': JSON.stringify({
        default: {
          data: [
            { id: 'testId1' },
            { id: 'testId2' },
            { id: 12345 }, // Notice this id is a number
          ],
        },
      }),
    });
  });

  // After each test, we clear the mock file system
  afterEach(() => {
    mockFs.restore();
  });

  // Test case: when the deep.json file does not exist
  it('should throw an error if the deep.json file does not exist', async () => {
    const params: GeneratePackageClassParam = {
      deepJsonFilePath: 'path/to/nonexistent/deepJson',
      outputFilePath: 'path/to/output',
      packageName: 'testPackage',
    };

    // We expect an error to be thrown
    await expect(generatePackageClass(params)).rejects.toThrow(
      new Error(`deep.json file does not exist in ${params.deepJsonFilePath}`),
    );
  });

  // Test case: when the deep.json file exists
  it('should generate a package class and write it to the output file', async () => {
    const params: GeneratePackageClassParam = {
      deepJsonFilePath: 'path/to/deepJson',
      outputFilePath: 'path/to/output',
      packageName: 'testPackage',
    };

    // Run the function
    await generatePackageClass(params);

    // Read the content of the output file
    const writtenClassDefinition = await fs.readFile(params.outputFilePath, 'utf-8');

    // We expect the written class to contain certain strings
    expect(writtenClassDefinition).toContain("public name: string = 'testPackage'"); // the package name
    expect(writtenClassDefinition).toContain("public testId1 = this.createEntity(\"testId1\")"); // the first link id
    expect(writtenClassDefinition).toContain("public testId2 = this.createEntity(\"testId2\")"); // the second link id

    // We expect the written class NOT to contain the id which is a number
    expect(writtenClassDefinition).not.toContain("public 12345 = this.createEntity(\"12345\")");
  });
});
