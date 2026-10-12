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
    protocol: "MCP Streamable HTTP + HTTPS + JSON + Markdown",
    authentication: { required: false, schemes: [] },
    write_operations: { available: false, reason: "The public API and MCP tools are read-only by design." },
    endpoints: {
      discovery: { method: "GET", url: `${base}/llms.txt`, content_type: "text/plain" },
      manifest: { method: "GET", url: `${base}/api/agent`, content_type: "application/json" },
      openapi: { method: "GET", url: `${base}/api/openapi.json`, content_type: "application/json" },
      mcp: { method: "POST", url: `${base}/mcp`, protocol: "MCP Streamable HTTP", authentication_required: false },
      health: { method: "GET", url: `${base}/api/health`, content_type: "application/json" },
      categories: { method: "GET", url: `${base}/api/categories`, content_type: "application/json" },
      search: { method: "GET", url: `${base}/api/manuals?q=DATABASE_URL`, content_type: "application/json" },
      manual_json: { method: "GET", url: `${base}/api/manuals/{slug}`, content_type: "application/json" },
      manual_markdown: { method: "GET", url: `${base}/api/manuals/{slug}?format=markdown`, content_type: "text/markdown" },
      stable_markdown_url: { method: "GET", url: `${base}/manuais/{slug}`, content_type: "text/markdown" },
    },
    mcp_tools: ["get_usage_instructions", "search_manuals", "read_manual", "list_categories", "check_service_health"],
    search_parameters: {
      q: "Optional search over title, summary, code, full Markdown content, and tags.",
      category: "Optional exact category slug.",
      tag: "Optional exact tag.",
      limit: "Optional integer from 1 to 100; defaults to 20.",
      offset: "Optional integer from 0 to 100000; defaults to 0.",
    },
    client_guidance: [
      "Start here or at /llms.txt to discover the API.",
      "For native tool calls, connect an MCP client to the mcp URL and discover its tools.",
      "Otherwise inspect /api/openapi.json and use the public REST API.",
      "Search before reading; then retrieve the complete manual.",
      "The public API and MCP server do not expose create, update, or delete operations.",
    ],
  }, { headers: jsonHeaders({ "Cache-Control": "public, max-age=300" }) });
}

export function OPTIONS() { return optionsResponse(); }
