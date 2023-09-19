import { execa } from "execa";
import { ensureGitIsConfigured } from "./ensure-git-is-configured.js";
import {
  GeneratePackageClassOptions,
  generatePackageClass,
} from "./generate-package-class.js";
import fsExtra from "fs-extra";
import { debug } from "./debug.js";

const moduleLog = debug.extend("build-typescript-library");

export async function buildTypescriptLibrary(
  options: BuildTypescriptLibraryOptions
) {
  const log = moduleLog.extend(buildTypescriptLibrary.name);
  log({ options });
  await ensureGitIsConfigured();
  if (options.generatePackageClassOptions !== null) {
    const { generatePackageClassOptions } = options;
    const outputFilePath =
      generatePackageClassOptions?.outputFilePath ?? "./src/package.ts";
    log({ outputFilePath });
    const deepJsonFilePath =
      generatePackageClassOptions?.deepJsonFilePath ?? "./deep.json";
    log({ deepJsonFilePath });
    const packageName =
      generatePackageClassOptions?.packageName ??
      (await fsExtra
        .readJson("./package.json")
        .then((packageJson) => packageJson.name)
        .catch((error) => {
          throw new Error(
            `Either specify packageName in generatePackageClassOptions or ensure that package.json exists in the current working directory. Error: ${error}`
          );
        }));
    log({ packageName });

    await generatePackageClass({
      packageName,
      deepJsonFilePath,
      outputFilePath,
    });

    const gitStatusResult = await execa("git", [
      "status",
      "--porcelain",
      outputFilePath,
    ]);
    log({ gitStatusResult });

    if (gitStatusResult.stdout !== "") {
      const gitAddResult = await execa("git", ["add", outputFilePath]);
      log({ gitAddResult });

      const gitCommitResult = await execa("git", [
        "commit",
        "--mesage",
        "Generate new package class",
      ]);
      log({ gitCommitResult });

      const gitPushResult = await execa("git", ["push", "origin", "main"]);
      log({ gitPushResult });
    }
  }

  const tscResult = await execa("tsc");
  log({ tscResult });
}

export interface BuildTypescriptLibraryOptions {
  generatePackageClassOptions?: GeneratePackageClassOptions | undefined | null;
}
