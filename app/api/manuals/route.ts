import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { jsonHeaders, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") || "").trim().slice(0, 120);
  const category = (params.get("category") || "").trim().slice(0, 100);
  const tag = (params.get("tag") || "").trim().slice(0, 80);
  const rawLimit = Number(params.get("limit") ?? 20);
  const rawOffset = Number(params.get("offset") ?? 0);
  const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.trunc(rawLimit))) : 20;
  const offset = Number.isFinite(rawOffset) ? Math.min(100000, Math.max(0, Math.trunc(rawOffset))) : 0;
  const predicates = `m.status = 'published'
    AND ($1 = '' OR m.title ILIKE '%' || $1 || '%' OR m.summary ILIKE '%' || $1 || '%' OR m.code ILIKE '%' || $1 || '%' OR m.content_md ILIKE '%' || $1 || '%' OR $1 = ANY(m.tags))
    AND ($2 = '' OR c.slug = $2)
    AND ($3 = '' OR $3 = ANY(m.tags))`;

  try {
    const values = [q, category, tag];
    const [totalResult, pageResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM manuals m LEFT JOIN categories c ON c.id = m.category_id WHERE ${predicates}`, values),
      pool.query(
        `SELECT m.id::int AS id, m.slug, m.code, m.title, m.summary, m.tags, m.version, m.updated_at,
                c.name AS category_name, c.slug AS category_slug
         FROM manuals m LEFT JOIN categories c ON c.id = m.category_id
         WHERE ${predicates}
         ORDER BY m.updated_at DESC, m.id DESC
         LIMIT $4 OFFSET $5`,
        [...values, limit, offset],
      ),
    ]);

    const base = request.nextUrl.origin;
    const items = pageResult.rows.map((manual) => ({
      ...manual,
      api_url: new URL(`/api/manuals/${encodeURIComponent(manual.slug)}`, base).toString(),
      markdown_url: new URL(`/api/manuals/${encodeURIComponent(manual.slug)}?format=markdown`, base).toString(),
      stable_markdown_url: new URL(`/manuais/${encodeURIComponent(manual.slug)}`, base).toString(),
    }));
    const total = totalResult.rows[0]?.total ?? 0;
    const nextOffset = offset + items.length;
    const nextQuery = new URLSearchParams();
    if (q) nextQuery.set("q", q);
    if (category) nextQuery.set("category", category);
    if (tag) nextQuery.set("tag", tag);
    nextQuery.set("limit", String(limit));
    nextQuery.set("offset", String(nextOffset));
    const nextUrl = nextOffset < total ? new URL(`/api/manuals?${nextQuery.toString()}`, base).toString() : null;

    return NextResponse.json({
      name: "Manual do Agente GPT", count: items.length, total, limit, offset,
      has_more: nextOffset < total, next_url: nextUrl, query: { q, category, tag }, items,
    }, { headers: jsonHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar os manuais.", retryable: true },
      { status: 503, headers: jsonHeaders({ "Cache-Control": "no-store" }) },
    );
  }
}

export function OPTIONS() { return optionsResponse(); }
