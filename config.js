// Helper function to get the YYYY-MM-DD date string from X days ago
const getPastDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]; 
};

export const config = {
  query: `stars:<=1000 language:javascript pushed:>=${getPastDateString(7)}`,  // number within getPastDateString decides days since last commit 
  limit: 15,
  delay: 1500,
  cacheFile: "./cache/scanned.json", // Stores already scanned repos within cache so that it wont get scanned again in next run
  fileExtensions: [".js",".mjs",".cjs",".ts",".md"], // specify which file extensions to check
  maxFilesperRepo: 10000000
};
