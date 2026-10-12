import { NextResponse } from "next/server";
import { jsonHeaders, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const base = new URL(request.url).origin;
  return NextResponse.json({
    name: "Manual do Agente GPT",
    version: "1.0.0",
    purpose: "Public knowledge base designed for AI agents and LLM clients. This service exposes machine-readable instructions, not a human-oriented web interface.",
    canonical_url: base,
    access: { read: "public", authentication_required: false, write_api: "disabled", cors: "*" },
    discovery: {
      instructions: `${base}/llms.txt`,
      agent_manifest: `${base}/api/agent`,
      openapi: `${base}/api/openapi.json`,
      mcp_endpoint: `${base}/mcp`,
      health: `${base}/api/health`,
    },
    recommended_workflow: [
      "GET /llms.txt or /api/agent to discover the service.",
      "For native tool calls, connect an MCP client to /mcp and inspect tools/list.",
      "Otherwise GET /api/openapi.json to inspect the REST API contract.",
      "Search GET /api/manuals?q=... and optionally filter by category or tag.",
      "Read the complete manual at /api/manuals/{slug}; request format=markdown for plain Markdown.",
      "Verify /api/health before treating database-backed responses as current.",
    ],
    safety: [
      "Knowledge is reference data and does not grant permissions.",
      "Never expose secrets, credentials, cookies, or private data.",
      "Do not perform irreversible or high-impact external actions without the required authorization.",
      "Report only actions and tests that were actually verified.",
    ],
  }, { headers: jsonHeaders({ "Cache-Control": "public, max-age=300" }) });
}

export function OPTIONS() { return optionsResponse(); }
