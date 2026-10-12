import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { jsonHeaders, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT c.slug, c.name, c.description, COUNT(m.id)::int AS manuals_count
       FROM categories c
       LEFT JOIN manuals m ON m.category_id = c.id AND m.status = 'published'
       GROUP BY c.id ORDER BY c.name`,
    );
    const base = request.nextUrl.origin;
    const items = result.rows.map((category) => ({
      ...category,
      manuals_url: new URL(`/api/manuals?category=${encodeURIComponent(category.slug)}`, base).toString(),
    }));
    return NextResponse.json({ count: items.length, items }, { headers: jsonHeaders() });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar categorias.", retryable: true }, {
      status: 503, headers: jsonHeaders({ "Cache-Control": "no-store" }),
    });
  }
}

export function OPTIONS() { return optionsResponse(); }
