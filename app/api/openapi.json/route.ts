import { NextResponse } from "next/server";
import { jsonHeaders, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const base = new URL(request.url).origin;
  const errorSchema = { "$ref": "#/components/schemas/Error" };
  const jsonError = { "application/json": { schema: errorSchema } };
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Manual do Agente GPT — Public Read API",
      version: "1.0.0",
      description: "Read-only API exposing public operational manuals to AI agents. No API key or user session is required.",
    },
    servers: [{ url: base }],
    security: [],
    paths: {
      "/": {
        get: {
          summary: "Machine-readable service index",
          responses: { "200": { description: "Service index and endpoint links" } },
        },
      },
      "/llms.txt": {
        get: {
          summary: "Agent reading instructions",
          responses: { "200": { description: "Plain text instructions", content: { "text/plain": { schema: { type: "string" } } } } },
        },
      },
      "/api/agent": {
        get: {
          summary: "Agent manifest",
          responses: { "200": { description: "Agent manifest", content: { "application/json": { schema: { type: "object" } } } } },
        },
      },
      "/mcp": {
        post: {
          summary: "Call the public MCP tool server",
          description: "MCP Streamable HTTP using JSON-RPC 2.0. Discover read-only tools with tools/list and invoke them with tools/call. Browser requests must be same-origin.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", description: "MCP JSON-RPC request" },
              },
            },
          },
          responses: {
            "200": { description: "MCP protocol response or event stream" },
            "400": { description: "Invalid MCP message" },
            "403": { description: "Origin mismatch" },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "Check application and database connectivity",
          responses: {
            "200": { description: "Database connected" },
            "503": { description: "Database unavailable", content: jsonError },
          },
        },
      },
      "/api/categories": {
        get: {
          summary: "List public categories",
          responses: {
            "200": { description: "Category list", content: { "application/json": { schema: { "$ref": "#/components/schemas/CategoryList" } } } },
            "503": { description: "Database unavailable", content: jsonError },
          },
        },
      },
      "/api/manuals": {
        get: {
          summary: "Search and list published manuals",
          parameters: [
            { in: "query", name: "q", schema: { type: "string", maxLength: 120 }, description: "Search title, summary, code, Markdown content and tags." },
            { in: "query", name: "category", schema: { type: "string", maxLength: 100 }, description: "Exact category slug." },
            { in: "query", name: "tag", schema: { type: "string", maxLength: 80 }, description: "Exact tag." },
            { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
            { in: "query", name: "offset", schema: { type: "integer", minimum: 0, maximum: 100000, default: 0 } },
          ],
          responses: {
            "200": { description: "Matching manual summaries", content: { "application/json": { schema: { "$ref": "#/components/schemas/ManualList" } } } },
            "503": { description: "Database unavailable", content: jsonError },
          },
        },
      },
      "/api/manuals/{slug}": {
        get: {
          summary: "Read the full content of a published manual",
          parameters: [
            { in: "path", name: "slug", required: true, schema: { type: "string" } },
            { in: "query", name: "format", schema: { type: "string", enum: ["json", "markdown"], default: "json" } },
            { in: "header", name: "Accept", schema: { type: "string" }, description: "Use text/markdown to request Markdown." },
          ],
          responses: {
            "200": {
              description: "Complete manual as JSON by default or Markdown when requested",
              content: {
                "application/json": { schema: { "$ref": "#/components/schemas/Manual" } },
                "text/markdown": { schema: { type: "string" } },
              },
            },
            "404": { description: "Manual not found", content: jsonError },
            "503": { description: "Database unavailable", content: jsonError },
          },
        },
      },
      "/manuais/{slug}": {
        get: {
          summary: "Stable Markdown URL for one manual",
          parameters: [{ in: "path", name: "slug", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Complete manual as Markdown", content: { "text/markdown": { schema: { type: "string" } } } },
            "404": { description: "Manual not found" },
            "503": { description: "Database unavailable" },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object", required: ["error"],
          properties: { error: { type: "string" }, retryable: { type: "boolean" } },
        },
        ManualSummary: {
          type: "object",
          required: ["id", "slug", "code", "title", "summary", "tags", "version", "updated_at", "api_url", "markdown_url", "stable_markdown_url"],
          properties: {
            id: { type: "integer" }, slug: { type: "string" }, code: { type: "string" },
            title: { type: "string" }, summary: { type: "string" }, tags: { type: "array", items: { type: "string" } },
            version: { type: "integer" }, updated_at: { type: "string", format: "date-time" },
            category_name: { type: ["string", "null"] }, category_slug: { type: ["string", "null"] },
            api_url: { type: "string", format: "uri" }, markdown_url: { type: "string", format: "uri" },
            stable_markdown_url: { type: "string", format: "uri" },
          },
        },
        Manual: {
          allOf: [
            { "$ref": "#/components/schemas/ManualSummary" },
            { type: "object", required: ["content_md"], properties: { content_md: { type: "string" } } },
          ],
        },
        ManualList: {
          type: "object",
          required: ["name", "count", "total", "limit", "offset", "has_more", "next_url", "query", "items"],
          properties: {
            name: { type: "string" }, count: { type: "integer" }, total: { type: "integer" },
            limit: { type: "integer" }, offset: { type: "integer" }, has_more: { type: "boolean" },
            next_url: { type: ["string", "null"], format: "uri" }, query: { type: "object" },
            items: { type: "array", items: { "$ref": "#/components/schemas/ManualSummary" } },
          },
        },
        Category: {
          type: "object", required: ["slug", "name", "description", "manuals_count", "manuals_url"],
          properties: {
            slug: { type: "string" }, name: { type: "string" }, description: { type: "string" },
            manuals_count: { type: "integer" }, manuals_url: { type: "string", format: "uri" },
          },
        },
        CategoryList: {
          type: "object", required: ["count", "items"],
          properties: { count: { type: "integer" }, items: { type: "array", items: { "$ref": "#/components/schemas/Category" } } },
        },
      },
    },
  };
  return NextResponse.json(spec, { headers: jsonHeaders({ "Cache-Control": "public, max-age=300" }) });
}

export function OPTIONS() {
  return optionsResponse();
}
