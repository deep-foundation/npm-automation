import exec from "@simplyhexagonal/exec";

export async function execWrapped({ command }: { command: string }) {
   const { execPromise, execProcess } = exec(command);
   const execResult = await execPromise;
   if (execResult.exitCode !== 0) {
     throw new Error(execResult.stderrOutput);
   }
   console.log(execResult.stdoutOutput);
   return { execProcess, execPromise, execResult };
 }