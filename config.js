export const config = {
  query: "stars:>100000 language:javascript",
  limit: 6,
  delay: 1500,
  cacheFile: "./cache/scanned.json",
  fileExtensions: [".js",".mjs",".cjs",".ts",".md"],
  maxFilesperRepo: 10000000
};
