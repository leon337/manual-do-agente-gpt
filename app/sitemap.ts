import type { MetadataRoute } from "next";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://manual-do-agente-gpt.vercel.app").replace(/\/$/, "");
  const fixed: MetadataRoute.Sitemap = [
    { url: base + "/", lastModified: new Date() },
    { url: base + "/llms.txt", lastModified: new Date() },
    { url: base + "/api/agent", lastModified: new Date() },
    { url: base + "/api/openapi.json", lastModified: new Date() },
    { url: base + "/api/categories", lastModified: new Date() },
  ];

  try {
    const result = await pool.query("SELECT slug, updated_at FROM manuals WHERE status = 'published' ORDER BY updated_at DESC");
    const manuals: MetadataRoute.Sitemap = result.rows.flatMap((manual) => [
      { url: base + "/api/manuals/" + encodeURIComponent(manual.slug), lastModified: new Date(manual.updated_at) },
      { url: base + "/api/manuals/" + encodeURIComponent(manual.slug) + "?format=markdown", lastModified: new Date(manual.updated_at) },
      { url: base + "/manuais/" + encodeURIComponent(manual.slug), lastModified: new Date(manual.updated_at) },
    ]);
    return [...fixed, ...manuals];
  } catch {
    return fixed;
  }
}
