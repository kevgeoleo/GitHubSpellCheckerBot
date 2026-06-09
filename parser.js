export function cleanMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, "")   // code blocks
    .replace(/`[^`]*`/g, "")         // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
    .replace(/https?:\/\/\S+/g, ""); // URLs
}
