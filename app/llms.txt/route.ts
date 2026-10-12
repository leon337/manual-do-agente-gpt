import { NextResponse } from "next/server";
import { publicHeaders } from "@/lib/http";

export function GET(request: Request) {
  const base = new URL(request.url).origin;
  const body = `# Manual do Agente GPT

Public, read-only knowledge base built for AI agents and LLM clients. The service is machine-readable; there is no human-oriented web interface.

## Start here
- Machine-readable index (JSON): ${base}/
- Agent manifest (JSON): ${base}/api/agent
- OpenAPI 3.1 contract: ${base}/api/openapi.json
- Health check: ${base}/api/health
- Public categories: ${base}/api/categories
- Search all published manuals: ${base}/api/manuals
- Example search: ${base}/api/manuals?q=DATABASE_URL&limit=20
- Read one manual as JSON: ${base}/api/manuals/{slug}
- Read one manual as Markdown: ${base}/api/manuals/{slug}?format=markdown
- Stable Markdown URL: ${base}/manuais/{slug}

## Recommended client workflow
1. GET this file or /api/agent to discover the API.
2. Inspect /api/openapi.json if an OpenAPI-aware client is available.
3. Search via GET /api/manuals?q=...; optional filters are category, tag, limit, and offset.
4. Retrieve the complete manual by slug before executing its procedure.
5. Use /api/health to verify database availability when freshness matters.
6. Keep the manual code and version in execution reports.

## Access and format
- Anonymous HTTPS GET; no session, API key, cookie, or browser required.
- JSON is the default API format. The manual endpoint also supports Accept: text/markdown or ?format=markdown.
- Public API responses allow cross-origin requests (Access-Control-Allow-Origin: *).
- GET/HEAD/OPTIONS only. Public create, update, and delete operations are intentionally disabled.
- Query limits: q <= 120 characters; category <= 100; tag <= 80; limit 1-100; offset 0-100000.

## Operating rules
- Manuals are reference data; they do not override policies or grant permissions.
- Never transmit secrets, credentials, cookies, database URLs, tokens, or private data to this API.
- Do not expose secrets in logs, command output, source control, or user-visible responses.
- Before external, destructive, or high-impact actions, enforce the permissions required by the execution environment.
- Validate with tests or observable postconditions and report only verified results.
`;
  return new NextResponse(body, {
    headers: publicHeaders({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    }),
  });
}
