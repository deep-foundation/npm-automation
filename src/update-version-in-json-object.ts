import { writeFile } from 'fs-extra';

export async function updateDeepJsonVersion({
  version,
  filePath,
}: UpdateDeepJsonVersionParam) {
  const {default: json} = await import(filePath);
  json.package.version = version;

  await writeFile(filePath, JSON.stringify(json, null, 2));
}

export interface UpdateDeepJsonVersionParam {
  version: string;
  filePath: string;
}
