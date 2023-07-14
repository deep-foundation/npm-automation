import path from 'path';
import fsExtra from 'fs-extra';
import { prependFile } from '@freephoenix888/prepend-file';

const dirPath = path.join(process.cwd(), './dist');

fsExtra
  .readdir(dirPath)
  .then((files) => {
    files.forEach((file) => {
      if (file.endsWith('-cli.js')) {
        const filePath = path.join(dirPath, file);
        prependFile({
          filePath: filePath,
          content: '#!/usr/bin/env node\n',
        }).catch((err) =>
          console.log(`Failed to prepend shebang to ${file}: ${err}`)
        );
      }
    });
  })
  .catch((err) => console.log(`Failed to read directory: ${err}`));
