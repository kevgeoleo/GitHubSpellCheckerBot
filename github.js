import { fetchWithTimeout } from "./utils/http.js";

const TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  "User-Agent": "readme-spellbot",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
};

export async function searchRepos(query = "stars:>50", limit = 5) {
  /*const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`,
    { headers }
  );*/
  const res = await fetchWithTimeout(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`,
    { headers }
  );

  const data = await res.json();
  return data.items || [];
}

export async function getReadme(owner, repo) {
  /*const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: {
        "User-Agent": "readme-spellbot",
        "Accept": "application/vnd.github.raw",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
      }
    }
  );*/
  const res = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: {
        "User-Agent": "readme-spellbot",
        "Accept": "application/vnd.github.raw",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
      }
    }
  );

  if (!res.ok) throw new Error("No README");

  return await res.text();
}

export async function getRepoFiles(owner, repo) {
  // 1. get repo metadata first
  const repoRes = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers }
  );

  if (!repoRes.ok) throw new Error("Repo not found");

  const repoData = await repoRes.json();

  // 2. extract branch AFTER response
  const branch = repoData.default_branch || "main";

  // 3. now fetch file tree
  const res = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  );

  if (!res.ok) throw new Error("No tree");

  const data = await res.json();
  return data.tree || [];
}

export async function getFileContent(url) {
  const customHeaders = {
    ...headers,
    "Accept": "application/vnd.github.raw" // <-- Forces GitHub to send actual file text, not JSON
  };

  const res = await fetchWithTimeout(url, { headers: customHeaders });
  if (!res.ok) throw new Error(`No file content found at ${url}`);

  return await res.text();
}

/*export async function getFileContent(url) {
  //const res = await fetch(url, { headers });
  const res = await fetchWithTimeout(url, { headers });
  if (!res.ok) throw new Error("No file");

  return await res.text();
}*/