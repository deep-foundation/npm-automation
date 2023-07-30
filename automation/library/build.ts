import {buildTypescriptLibrary} from '../../src/build-typescript-library.js'

main();

async function main() {
  await buildTypescriptLibrary({
    generatePackageClassOptions: null
  })
}
