import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { manualAsMarkdown } from "@/lib/manual-format";
import { optionsResponse, publicHeaders } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const result = await pool.query(
      `SELECT m.slug, m.code, m.title, m.summary, m.content_md, m.tags, m.version, m.updated_at,
              c.name AS category_name
       FROM manuals m LEFT JOIN categories c ON c.id = m.category_id
       WHERE m.slug = $1 AND m.status = 'published' LIMIT 1`,
      [slug],
    );
    const manual = result.rows[0];
    if (!manual) {
      return new Response("# Manual não encontrado\n", {
        status: 404, headers: publicHeaders({ "Content-Type": "text/markdown; charset=utf-8" }),
      });
    }
    return new Response(manualAsMarkdown(manual, request.nextUrl.origin), {
      status: 200,
      headers: publicHeaders({
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Location": `/manuais/${encodeURIComponent(slug)}`,
      }),
    });
  } catch {
    return new Response("# Manual indisponível\n\nA consulta falhou; tente novamente.\n", {
      status: 503,
      headers: publicHeaders({ "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" }),
    });
  }
}

export function OPTIONS() { return optionsResponse(); }
