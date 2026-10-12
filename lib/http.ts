export const PUBLIC_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

export function publicHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": PUBLIC_CACHE_CONTROL,
    "X-Content-Type-Options": "nosniff",
    ...extra,
  };
}

export function jsonHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return publicHeaders({ "Content-Type": "application/json; charset=utf-8", ...extra });
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: publicHeaders({ "Cache-Control": "no-store" }) });
}
