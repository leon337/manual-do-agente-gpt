type ManualForMarkdown = {
  slug: string; code: string; title: string; summary: string; content_md: string;
  tags?: string[] | null; version?: number; updated_at?: string | Date; category_name?: string | null;
};

export function manualAsMarkdown(manual: ManualForMarkdown, baseUrl: string): string {
  const date = manual.updated_at ? new Date(manual.updated_at).toISOString() : "unknown";
  const tags = (manual.tags ?? []).join(", ") || "none";
  const category = manual.category_name || "uncategorized";
  const apiUrl = new URL("/api/manuals/" + encodeURIComponent(manual.slug), baseUrl).toString();
  return [
    `# ${manual.title}`, "",
    `- Code: ${manual.code}`,
    `- Slug: ${manual.slug}`,
    `- Category: ${category}`,
    `- Version: ${manual.version ?? 1}`,
    `- Updated at: ${date}`,
    `- Tags: ${tags}`,
    `- JSON source: ${apiUrl}`, "",
    "---", "",
    (manual.content_md || "").trim(), "",
  ].join("\n");
}
