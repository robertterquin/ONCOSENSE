// News proxy for the OncoSense app.
//
// Calls the GNews API (https://gnews.io) server-side so the API key never
// ships inside the app. The key is read from the GNEWS_API_KEY secret:
//   supabase secrets set GNEWS_API_KEY=<key>
//
// Request body (POST, JSON):
//   { "type": "search", "q": "cancer", "max": 30 }
//   { "type": "top-headlines", "max": 30 }
// Response: { "articles": [...] } in the GNews article format.

const GNEWS_BASE_URL = "https://gnews.io/api/v4";
const MAX_ARTICLES = 30;
const MAX_QUERY_LENGTH = 100;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GNEWS_API_KEY");
  if (!apiKey) {
    console.error("GNEWS_API_KEY secret is not set");
    return jsonResponse({ error: "News service is not configured" }, 500);
  }

  let body: { type?: unknown; q?: unknown; max?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const max = typeof body.max === "number" && Number.isFinite(body.max)
    ? Math.min(Math.max(Math.trunc(body.max), 1), MAX_ARTICLES)
    : MAX_ARTICLES;
  const params = new URLSearchParams({
    lang: "en",
    max: String(max),
    apikey: apiKey,
  });

  let endpoint: string;
  if (body.type === "search") {
    const q = typeof body.q === "string" ? body.q.trim() : "";
    if (!q || q.length > MAX_QUERY_LENGTH) {
      return jsonResponse({ error: "Invalid search query" }, 400);
    }
    endpoint = "search";
    params.set("q", q);
  } else if (body.type === "top-headlines") {
    endpoint = "top-headlines";
    params.set("category", "health");
  } else {
    return jsonResponse({ error: "Unknown request type" }, 400);
  }

  try {
    const upstream = await fetch(`${GNEWS_BASE_URL}/${endpoint}?${params}`);
    if (!upstream.ok) {
      console.error(`GNews ${endpoint} failed: ${upstream.status}`, await upstream.text());
      return jsonResponse({ error: "Failed to load news" }, 502);
    }
    const data = await upstream.json();
    return jsonResponse({
      articles: Array.isArray(data?.articles) ? data.articles : [],
    });
  } catch (error) {
    console.error(`GNews ${endpoint} request error`, error);
    return jsonResponse({ error: "Failed to load news" }, 502);
  }
});
