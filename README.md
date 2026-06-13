# GitHubSpellCheckerBot

Scans GitHub repositories and detects spelling mistakes in specified files

## Configurations

Modify fields within `config.js`

| Configuration Option | Description                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`              | Specify the GitHub search query, such as minimum star rating, programming language, days since last commit, or other GitHub search filters. |
| `limit`              | Maximum number of repositories to scan during a run.                                                                                        |
| `delay`              | Delay (in milliseconds) between scanning successive repositories to avoid hitting GitHub API rate limits.                                   |
| `cacheFile`          | Path to the cache file used to store repositories that have already been scanned. Cached repositories will be skipped in future runs.       |
| `fileExtensions`     | List of file extensions to scan for spelling mistakes (e.g. `.js`, `.ts`, `.mjs`, `.cjs`, `.md`).                                           |
| `maxFilesPerRepo`    | Maximum number of matching files to scan within a single repository. Useful for limiting runtime on very large repositories.                |

## Run

1. install dependencies:

```bash
npm install
```

2. Modify `config.js` as per need
3. Add you GitHub API key to `.env`

```bash
GITHUB_TOKEN=<your-github-token>
```
New token can be generated here: https://github.com/settings/tokens

3. Run using node:

```bash
node index.js
```
