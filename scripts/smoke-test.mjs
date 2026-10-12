import assert from "node:assert/strict";

const base = (process.env.BASE_URL || "https://manual-do-agente-gpt.vercel.app").replace(/\/$/, "");
const results = [];

async function check(name, path, validate, accept = "application/json") {
  const response = await fetch(base + path, {
    headers: { Accept: accept },
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });
  const body = await response.text();
  assert.equal(response.status, 200, `${name}: expected HTTP 200, got ${response.status}; body=${body.slice(0, 180)}`);
  validate(response, body);
  results.push({ name, status: response.status, contentType: response.headers.get("content-type") || "unknown" });
}

await check("root machine index", "/", (_response, body) => {
  const data = JSON.parse(body);
  assert.equal(data.name, "Manual do Agente GPT");
  assert.equal(data.access.authentication_required, false);
  assert.equal(data.access.write_api, "disabled");
});

await check("LLM instructions", "/llms.txt", (response, body) => {
  assert.match(response.headers.get("content-type") || "", /text\/plain/i);
  assert.match(body, /OpenAPI 3\.1/);
  assert.match(body, /no session, API key, cookie, or browser required/i);
}, "text/plain");

await check("agent manifest", "/api/agent", (_response, body) => {
  const data = JSON.parse(body);
  assert.equal(data.authentication.required, false);
  assert.equal(data.write_operations.available, false);
  assert.ok(data.endpoints.openapi.url.endsWith("/api/openapi.json"));
});

await check("OpenAPI contract", "/api/openapi.json", (_response, body) => {
  const spec = JSON.parse(body);
  assert.equal(spec.openapi, "3.1.0");
  for (const path of ["/api/agent", "/api/manuals", "/api/manuals/{slug}", "/api/categories", "/api/health"]) {
    assert.ok(spec.paths[path], `OpenAPI is missing ${path}`);
  }
});

await check("database health", "/api/health", (_response, body) => {
  const data = JSON.parse(body);
  assert.equal(data.status, "ok");
  assert.equal(data.database, "connected");
});

await check("categories endpoint", ("/api/categories"), (response, body) => {
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  const data = JSON.parse(body);
  assert.ok(Array.isArray(data.items));
  assert.ok(data.count > 0);
});

const manualSlug = "configurar-variaveis-ambiente-vercel-neon";
await check("search by content", "/api/manuals?q=DATABASE_URL&limit=20", (_response, body) => {
  const data = JSON.parse(body);
  assert.ok(data.total >= 1);
  const item = data.items.find((entry) => entry.slug === manualSlug);
  assert.ok(item, "search did not return the deployment manual");
  assert.equal(item.api_url, base + "/api/manuals/" + manualSlug);
});

await check("complete manual JSON", "/api/manuals/" + manualSlug, (response, body) => {
  assert.match(response.headers.get("content-type") || "", /application\/json/i);
  const data = JSON.parse(body);
  assert.equal(data.slug, manualSlug);
  assert.equal(data.code, "DEP-001");
  assert.ok(data.content_md.includes("DATABASE_URL"));
  assert.ok(data.markdown_url.includes("?format=markdown"));
  assert.doesNotMatch(body, /postgres(?:ql)?:\/\//i, "API response must not leak a database URI");
});

await check("manual Markdown content negotiation", "/api/manuals/" + manualSlug + "?format=markdown", (response, body) => {
  assert.match(response.headers.get("content-type") || "", /text\/markdown/i);
  assert.match(body, /Configurar variáveis de ambiente/i);
  assert.match(body, /redeploy|novo deploy/i);
}, "text/markdown");

await check("stable Markdown route", "/manuais/" + manualSlug, (response, body) => {
  assert.match(response.headers.get("content-type") || "", /text\/markdown/i);
  assert.match(body, /Code: DEP-001/i);
}, "text/markdown");

const preflight = await fetch(base + "/api/manuals", {
  method: "OPTIONS",
  headers: { Origin: "https://example.ai", "Access-Control-Request-Method": "GET" },
  signal: AbortSignal.timeout(15000),
});
assert.equal(preflight.status, 204, `CORS preflight should return 204, got ${preflight.status}`);
assert.equal(preflight.headers.get("access-control-allow-origin"), "*");
results.push({ name: "CORS preflight", status: preflight.status, contentType: "no body" });

const writeAttempt = await fetch(base + "/api/manuals", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "not allowed" }),
  signal: AbortSignal.timeout(15000),
});
assert.equal(writeAttempt.status, 405, `public write API must stay disabled, got ${writeAttempt.status}`);
results.push({ name: "public write protection", status: writeAttempt.status, contentType: "not writable" });

console.log(JSON.stringify({ success: true, base, checks_passed: results.length, results }, null, 2));
