import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { jsonHeaders, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await pool.query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" }, {
      headers: jsonHeaders({ "Cache-Control": "no-store" }),
    });
  } catch {
    return NextResponse.json({ status: "error", database: "unavailable", retryable: true }, {
      status: 503, headers: jsonHeaders({ "Cache-Control": "no-store" }),
    });
  }
}

export function OPTIONS() { return optionsResponse(); }
