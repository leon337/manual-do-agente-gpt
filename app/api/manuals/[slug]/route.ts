import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { manualAsMarkdown } from "@/lib/manual-format";
import { jsonHeaders, optionsResponse, publicHeaders } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wantsMarkdown =
    request.nextUrl.searchParams.get("format") === "markdown" ||
    (request.headers.get("accept") || "").toLowerCase().includes("text/markdown");

  try {
    const result = await pool.query(
      `SELECT m.id, m.slug, m.code, m.title, m.summary, m.content_md, m.tags, m.version, m.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM manuals m LEFT JOIN categories c ON c.id = m.category_id
       WHERE m.slug = $1 AND m.status = 'published' LIMIT 1`,
      [slug],
    );
    const manual = result.rows[0];
    if (!manual) {
      return NextResponse.json({ error: "Manual não encontrado.", slug }, {
        status: 404, headers: jsonHeaders({ "Cache-Control": "public, max-age=60" }),
      });
    }

    const base = request.nextUrl.origin;
    if (wantsMarkdown) {
      return new Response(manualAsMarkdown(manual, base), {
        status: 200,
        headers: publicHeaders({
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Location": `/api/manuals/${encodeURIComponent(slug)}?format=markdown`,
        }),
      });
    }

    return NextResponse.json({
      ...manual,
      api_url: new URL(`/api/manuals/${encodeURIComponent(slug)}`, base).toString(),
      markdown_url: new URL(`/api/manuals/${encodeURIComponent(slug)}?format=markdown`, base).toString(),
      stable_markdown_url: new URL(`/manuais/${encodeURIComponent(slug)}`, base).toString(),
    }, { headers: jsonHeaders() });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar o manual.", retryable: true }, {
      status: 503, headers: jsonHeaders({ "Cache-Control": "no-store" }),
    });
  }
}

export function OPTIONS() { return optionsResponse(); }
