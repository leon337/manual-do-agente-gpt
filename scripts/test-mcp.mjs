import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const base = (process.env.BASE_URL || "https://manual-do-agente-gpt.vercel.app").replace(/\/$/, "");
const endpoint = new URL("/mcp", base + "/");
const client = new Client({ name: "manual-do-agente-gpt-conformance-test", version: "1.0.0" });
const results = [];

function textFrom(result) {
  const item = (result.content || []).find((entry) => entry.type === "text");
  assert.ok(item, "MCP tool response did not include text content");
  return item.text;
}

try {
  await client.connect(new StreamableHTTPClientTransport(endpoint));
  results.push({ name: "MCP Streamable HTTP initialize/connect", passed: true });

  const listed = await client.listTools();
  const names = listed.tools.map((tool) => tool.name);
  for (const name of ["get_usage_instructions", "search_manuals", "read_manual", "list_categories", "check_service_health"]) {
    assert.ok(names.includes(name), "missing MCP tool: " + name);
  }
  results.push({ name: "MCP tools/list", passed: true, tools: names });
  const usage = JSON.parse(textFrom(await client.callTool({
    name: "get_usage_instructions",
    arguments: {},
  })));
  assert.ok(usage.available_tools.includes("search_manuals"));
  assert.ok(usage.instructions_url.endsWith("/llms.txt"));
  results.push({ name: "MCP get_usage_instructions", passed: true });

  const categoryResult = await client.callTool({ name: "list_categories", arguments: {} });
  const categories = JSON.parse(textFrom(categoryResult));
  assert.ok(categories.items.some((item) => item.slug === "deploy-infraestrutura"));
  results.push({ name: "MCP list_categories", passed: true, total: categories.count });


  const healthResult = await client.callTool({ name: "check_service_health", arguments: {} });
  const health = JSON.parse(textFrom(healthResult));
  assert.equal(health.status, "ok");
  assert.equal(health.database, "connected");
  results.push({ name: "MCP check_service_health", passed: true });

  const searchResult = await client.callTool({
    name: "search_manuals",
    arguments: { q: "DATABASE_URL", category: "deploy-infraestrutura", tag: "vercel", limit: 10, offset: 0 },
  });
  const search = JSON.parse(textFrom(searchResult));
  assert.ok(search.total >= 1);
  assert.ok(search.items.some((item) => item.code === "DEP-001"));
  results.push({ name: "MCP search_manuals", passed: true, total: search.total });

  const manualResult = await client.callTool({
    name: "read_manual",
    arguments: { slug: "configurar-variaveis-ambiente-vercel-neon", format: "markdown" },
  });
  const markdown = textFrom(manualResult);
  assert.match(markdown, /DEP-001/);
  assert.match(markdown, /DATABASE_URL/);
  assert.match(markdown, /redeploy/i);
  assert.doesNotMatch(markdown, /postgres(?:ql)?:\/\//i);
  results.push({ name: "MCP read_manual Markdown", passed: true });
  const manualJsonResult = await client.callTool({
    name: "read_manual",
    arguments: { slug: "configurar-variaveis-ambiente-vercel-neon", format: "json" },
  });
  const manualJson = JSON.parse(textFrom(manualJsonResult));
  assert.equal(manualJson.code, "DEP-001");
  assert.ok(manualJson.content_md.includes("DATABASE_URL"));
  results.push({ name: "MCP read_manual JSON", passed: true });


  const missing = await client.callTool({
    name: "read_manual",
    arguments: { slug: "slug-that-does-not-exist", format: "json" },
  });
  assert.equal(missing.isError, true);
  results.push({ name: "MCP nonexistent manual is a tool error", passed: true });
} finally {
  await client.close();
}


const originCheck = await fetch(endpoint, {
  method: "POST",
  headers: {
    Origin: "https://example.ai",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "origin-check",
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "origin-check", version: "1.0.0" },
    },
  }),
  signal: AbortSignal.timeout(15000),
});
assert.equal(originCheck.status, 403, "MCP must reject cross-origin browser requests");
results.push({ name: "MCP cross-origin protection", passed: true, status: originCheck.status });

console.log(JSON.stringify({ success: true, endpoint: endpoint.toString(), checks_passed: results.length, results }, null, 2));
