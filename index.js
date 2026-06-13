import "dotenv/config";
import { searchRepos, getRepoFiles, getFileContent } from "./github.js";
import { findTypos } from "./spellcheck.js";
import { config } from "./config.js";
import { loadCache, saveCache } from "./cache.js";
import { saveResults } from "./utils/output.js";

const FILE_EXTENSIONS = config.fileExtensions;
const MAX_FILES = config.maxFilesperRepo;
const repoResults = [];

async function run() {
  console.log("🔍 Scanning GitHub source files...\n");

  const cache = loadCache(config.cacheFile);
  const repos = await searchRepos(config.query, config.limit);

  for (const repo of repos) {
    const repoName = repo.full_name;

    if (cache.has(repoName)) {
      console.log(`⏭️ Skipping cached: ${repoName}`);
      continue;
    }

    console.log(`🔍 Scanning: ${repoName}`);
    const [owner, name] = repoName.split("/");

    try {
      const files = await getRepoFiles(owner, name);

      const jsFiles = files.filter(f =>
        f.type === "blob" &&
        FILE_EXTENSIONS.some(ext => f.path.endsWith(ext))
      ).slice(0, MAX_FILES);

      let allTypos = [];

      // Process files sequentially to preserve system resources and API limits
      for (const file of jsFiles) {
        try {
          console.log(`  📄 Checking: ${file.path}`);
          const content = await getFileContent(file.url);
          
          // Await each file spellcheck before moving to the next
          const typos = await findTypos(content, file.path);
          allTypos.push(...typos);
        } catch (fileErr) {
          console.log(`  ⚠️ Failed to check file ${file.path}:`, fileErr.message);
          continue; // Keep going with the rest of the files in this repo
        }
      }

      const uniqueTypos = [...new Set(allTypos)];

      if (uniqueTypos.length > 0) {
        console.log(`\n📦 ${repoName}`);
        console.log("Top 100 issues:");
        console.log(uniqueTypos.slice(0, 100));
      } else {
        console.log(`✅ ${repoName} clean`);
      }

      repoResults.push({
        repo: repoName,
        issues: uniqueTypos
      });

      cache.add(repoName);
      saveCache(config.cacheFile, cache);

      // insurance in case of crash
      saveResults("results.json", repoResults);

      await new Promise(r => setTimeout(r, config.delay));
    } catch (err) {
      console.log(`⚠️ Skipping repository ${repoName}:`, err.message);
    }
  }
  saveResults("results.json", repoResults);
}

run();

/*import "dotenv/config";
import { searchRepos, getRepoFiles, getFileContent } from "./github.js";
import { findTypos } from "./spellcheck.js";
import { config } from "./config.js";
import { loadCache, saveCache } from "./cache.js";
import { saveResults } from "./utils/output.js";

const FILE_EXTENSIONS = config.fileExtensions;
const MAX_FILES = config.maxFilesperRepo;
const repoResults = [];

async function run() {
  console.log("🔍 Scanning GitHub source files...\n");

  const cache = loadCache(config.cacheFile);
  const repos = await searchRepos(config.query, config.limit);

  for (const repo of repos) {
    const repoName = repo.full_name;

    if (cache.has(repoName)) {
      console.log(`⏭️ Skipping cached: ${repoName}`);
      continue;
    }

    console.log(`🔍 Scanning: ${repoName}`);
    const [owner, name] = repoName.split("/");

    try {
      const files = await getRepoFiles(owner, name);


      const jsFiles = files.filter(f =>
        f.type === "blob" &&
        FILE_EXTENSIONS.some(ext => f.path.endsWith(ext))
      ).slice(0, MAX_FILES);

      let allTypos = [];

      /*for (const file of jsFiles) {
        try {
          const content = await getFileContent(file.url);
          const typos = findTypos(content);

          allTypos.push(...typos);
        } catch {
          continue;
        }
      }
      
        const results = await Promise.allSettled(
        jsFiles.map(async (file) => {
          console.log("Checking:", file.path);
          const content = await getFileContent(file.url);
          //return findTypos(content);
          return findTypos(content, file.path);
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          allTypos.push(...r.value);
        }
      }

      const uniqueTypos = [...new Set(allTypos)];

      if (uniqueTypos.length > 0) {
        console.log(`\n📦 ${repoName}`);
        console.log("Top issues:");
        console.log(uniqueTypos.slice(0, 10));
      } else {
        console.log(`✅ ${repoName} clean`);
      }

      repoResults.push({
        repo: repoName,
        issues: uniqueTypos
      });

      cache.add(repoName);
      saveCache(config.cacheFile, cache);

      await new Promise(r => setTimeout(r, config.delay));
    } catch (err) {
      console.log(`⚠️ Skipping ${repoName}:`, err.message);
    }
  }
  saveResults("results.json", repoResults);
}

run();

/*import "dotenv/config";
import { searchRepos, getReadme } from "./github.js";
import { cleanMarkdown } from "./parser.js";
import { findTypos } from "./spellcheck.js";
import { config } from "./config.js";
import { loadCache, saveCache } from "./cache.js";

async function run() {
  console.log("🔍 Scanning GitHub README files...\n");

  const cache = loadCache(config.cacheFile);

  const repos = await searchRepos(config.query, config.limit);

  for (const repo of repos) {
    const repoName = repo.full_name;

    // ⛔ skip already scanned repos
    if (cache.has(repoName)) {
      console.log(`⏭️ Skipping cached: ${repoName}`);
      continue;
    }

    const [owner, name] = repoName.split("/");

    try {
      const readme = await getReadme(owner, name);
      const text = cleanMarkdown(readme);

      const typos = findTypos(text);

      if (typos.length > 0) {
        console.log(`\n📦 ${repoName}`);
        console.log("Top issues:");
        console.log(typos.slice(0, 10));
      } else {
        console.log(`✅ ${repoName} clean`);
      }

      // ✅ mark as scanned
      cache.add(repoName);
      saveCache(config.cacheFile, cache);

      await new Promise(r => setTimeout(r, config.delay));
    } catch (err) {
      console.log(`⚠️ Skipping ${repoName}`);
    }
  }
}

run();*/

/*import "dotenv/config";
import { searchRepos, getReadme } from "./github.js";
import { cleanMarkdown } from "./parser.js";
import { findTypos } from "./spellcheck.js";
import { config } from "./config.js";

async function run() {
  console.log("🔍 Scanning GitHub README files...\n");

  const repos = await searchRepos(config.query, config.limit);

  for (const repo of repos) {
    const [owner, name] = repo.full_name.split("/");

    try {
      const readme = await getReadme(owner, name);
      const text = cleanMarkdown(readme);

      //const typos = findTypos(text);
      const typos = await findTypos(text);

      if (typos.length > 0) {
        console.log(`\n📦 ${repo.full_name}`);
        console.log("Top issues:");
        console.log(typos.slice(0, 10));
      } else {
        console.log(`✅ ${repo.full_name} clean`);
      }

      await new Promise(r => setTimeout(r, config.delay));
    } catch (err) {
      console.log(`⚠️ Skipping ${repo.full_name}`);
    }
  }
}

run();*/
