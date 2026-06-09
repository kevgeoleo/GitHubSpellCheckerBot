import fs from "node:fs";

export function loadCache(file) {
  try {
    if (!fs.existsSync(file)) return new Set();
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return new Set(data);
  } catch {
    return new Set();
  }
}

export function saveCache(file, set) {
  fs.mkdirSync("./cache", { recursive: true });
  fs.writeFileSync(file, JSON.stringify([...set], null, 2));
}