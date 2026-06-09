import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Checks file content for spelling errors using cspell.
 * * @param {string} content - The text/code content of the file.
 * @param {string} filePath - The original path of the file (used for reporting).
 * @returns {Promise<string[]>} An array of formatted typo strings.
 */
export async function findTypos(content, filePath) {
  // Preserve the file extension so cspell applies the correct language rules
  const ext = path.extname(filePath) || ".js";
  const tempFileName = `tmp_${crypto.randomUUID()}${ext}`;
  const tempFilePath = path.resolve(tempFileName);

  try {
    // 1. Write the remote file content to a local temp file
    await fs.writeFile(tempFilePath, content, "utf8");

    let stdout = "";
    try {
      // 2. Run the local cspell binary
      const res = await execAsync(`node node_modules/cspell/bin.mjs "${tempFilePath}"`);
      stdout = res.stdout;

      //console.log("Output: ",stdout)

    } catch (error) {
      // cspell intentionally exits with code 1 if it finds typos.
      // Node's exec treats non-zero exit codes as errors, so we grab stdout from the caught error.
      stdout = error.stdout || "";

      if(stdout.includes("fix: ")){
        console.log("Error: ",stdout)        
      }

      
    }

    if(!stdout.includes("fix: ")){
        return []
    }

    const finalLines = [];
    const rawLines = stdout.split("\n").filter(Boolean);

    for (const line of rawLines) {
      if (line.includes("fix: ")) {
        // Swap the temporary filename tracks back to the real repository path string
        const formattedLine = line
          .replaceAll(tempFilePath, filePath)
          .replaceAll(tempFileName, filePath);
        
        finalLines.push(formattedLine);
      }
    }

    return finalLines;

    // 3. Parse the output and swap the temp filename back to the real repository path
    /*return stdout
      .split("\n")
      .filter(Boolean)
      .map(line => line.replaceAll(tempFilePath, filePath).replaceAll(tempFileName, filePath));*/

  } catch (err) {
    console.error(`❌ Error scanning ${filePath}:`, err.message);
    return [];
  } finally {
    // 4. Always clean up the temporary file, even if cspell crashes
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // File already deleted or inaccessible; safe to ignore
    }
  }
}


/*import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function getExtensionHint(text = "") {
  return ".txt";
}

export function findTypos(text, originalFile = "unknown") {
  const tmpFile = path.join(
    os.tmpdir(),
    `scan_${Date.now()}${getExtensionHint(text)}`
  );
  console.log("Running cspell on:", originalFile);
  fs.writeFileSync(tmpFile, text, "utf8");

  try {
    execSync(
      ` node_modules/cspell/bin.mjs "${tmpFile}"`,
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    console.log('no issue')
    return []; // no issues
  } catch (err) {
    console.log("Errpr: ",err)

    const output = err.stdout?.toString() || "";
    const results = [];

    for (const line of output.split("\n")) {
      // example:
      // /tmp/file:12:8 - Unknown word (teh)
      const match = line.match(/:(\d+):(\d+).*?\(([^)]+)\)/);

      if (match) {
        const [, lineNum, col, word] = match;

        results.push({
          file: originalFile,
          word,
          line: Number(lineNum),
          col: Number(col),
        });
      }
    }

    return results;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}*/

/*import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function getExtensionHint(text = "") {
  // fallback if unknown
  return ".txt";
}



export function findTypos(text) {
  // write temp file
  //const tmpFile = path.join(os.tmpdir(), `readme_${Date.now()}.md`);
  const tmpFile = path.join(
    os.tmpdir(),
    `scan_${Date.now()}${getExtensionHint(text)}`
  );
  fs.writeFileSync(tmpFile, text, "utf8");

  try {
    const output = execSync(`npx cspell "${tmpFile}" --no-progress --no-summary`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    // no errors = clean file
    return [];
  } catch (err) {
    const output = err.stdout?.toString() || "";

    // extract words from CSpell output
    const typos = [];

    const lines = output.split("\n");

    for (const line of lines) {
      // format: file.md:line:col - Unknown word (word)
      const match = line.match(/\(([^)]+)\)/);
      if (match) typos.push(match[1]);
    }

    return [...new Set(typos)];
  } finally {
    fs.unlinkSync(tmpFile);
  }
}*/