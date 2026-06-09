export const config = {
  query: "stars:>500 language:javascript",
  limit: 1,
  delay: 1500,
  cacheFile: "./cache/scanned.json",
  fileExtensions: [".js",".mjs",".cjs",".ts",".md"],
  maxFilesperRepo: 10000000
};
