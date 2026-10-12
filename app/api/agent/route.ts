import { NextResponse } from "next/server";
import { jsonHeaders, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const base = new URL(request.url).origin;
  return NextResponse.json({
    id: "manual-do-agente-gpt",
    name: "Manual do Agente GPT",
    version: "1.0.0",
    description: "A machine-readable, public library of reusable operational procedures for AI agents.",
    audience: ["AI agents", "LLM clients", "automated workflows"],
    human_interface: false,
    protocol: "HTTPS + JSON + Markdown",
    authentication: { required: false, schemes: [] },
    write_operations: { available: false, reason: "The public API is read-only by design." },
    endpoints: {
      discovery: { method: "GET", url: `${base}/llms.txt`, content_type: "text/plain" },
      manifest: { method: "GET", url: `${base}/api/agent`, content_type: "application/json" },
      openapi: { method: "GET", url: `${base}/api/openapi.json`, content_type: "application/json" },
      health: { method: "GET", url: `${base}/api/health`, content_type: "application/json" },
      categories: { method: "GET", url: `${base}/api/categories`, content_type: "application/json" },
      search: { method: "GET", url: `${base}/api/manuals?q=DATABASE_URL`, content_type: "application/json" },
      manual_json: { method: "GET", url: `${base}/api/manuals/{slug}`, content_type: "application/json" },
      manual_markdown: { method: "GET", url: `${base}/api/manuals/{slug}?format=markdown`, content_type: "text/markdown" },
      stable_markdown_url: { method: "GET", url: `${base}/manuais/{slug}`, content_type: "text/markdown" },
    },
    search_parameters: {
      q: "Optional search over title, summary, code, full Markdown content, and tags.",
      category: "Optional exact category slug.",
      tag: "Optional exact tag.",
      limit: "Optional integer from 1 to 100; defaults to 20.",
      offset: "Optional integer from 0 to 100000; defaults to 0.",
    },
    client_guidance: [
      "Start here or at /llms.txt; do not assume undocumented routes.",
      "Search before reading; then retrieve the complete manual.",
      "Prefer JSON for metadata and text/markdown for direct prompt ingestion.",
      "All read endpoints support cross-origin GET requests without authentication.",
      "The public API does not expose create, update, or delete operations.",
    ],
  }, { headers: jsonHeaders({ "Cache-Control": "public, max-age=300" }) });
}

export function OPTIONS() { return optionsResponse(); }
