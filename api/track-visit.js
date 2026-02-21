/**
 * Vercel Serverless Function — POST /api/track-visit
 *
 * Server-side visitor tracking with proper IP hashing.
 * Called from the frontend to log visits with the real hashed IP.
 *
 * Environment variables required:
 *   SUPABASE_URL         — Supabase project URL
 *   SUPABASE_SERVICE_KEY — Supabase service_role key
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ── Helpers ─── */
function hashIP(ip) {
  if (!ip) return "";
  return crypto
    .createHash("sha256")
    .update(ip + "bipin-salt-2026")
    .digest("hex")
    .substring(0, 16);
}

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    ""
  );
}

/* ── Rate limiter (in-memory, resets per cold start) ─── */
const recentRequests = new Map();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const RATE_LIMIT_MAX = 3; // max 3 requests per window per IP

function isRateLimited(ip) {
  const now = Date.now();
  const key = hashIP(ip);
  const entry = recentRequests.get(key);

  if (!entry || now - entry.firstRequest > RATE_LIMIT_WINDOW) {
    recentRequests.set(key, { firstRequest: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

/* ── Main Handler ─── */
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const clientIP = getClientIP(req);

  // Rate limiting
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const {
    page = "/",
    referrer = "",
    user_agent = "",
    device_type = "desktop",
    blog_slug = null,
    session_id = "",
  } = req.body || {};

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const ipHash = hashIP(clientIP);

  try {
    // Check if this IP + session already visited this page today (anti-spam)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let query = supabase
      .from("visitors")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("page", page)
      .gte("created_at", startOfDay.toISOString());

    if (blog_slug) {
      query = query.eq("blog_slug", blog_slug);
    }

    const { count: existingCount } = await query;
    const isUnique = (existingCount || 0) === 0;

    // Always insert, but mark whether it's unique
    const { error } = await supabase.from("visitors").insert([
      {
        page: String(page).substring(0, 200),
        referrer: String(referrer).substring(0, 500),
        user_agent: String(user_agent).substring(0, 500),
        ip_hash: ipHash,
        session_id: String(session_id).substring(0, 100),
        device_type: ["mobile", "desktop", "tablet"].includes(device_type)
          ? device_type
          : "desktop",
        blog_slug: blog_slug ? String(blog_slug).substring(0, 200) : null,
        is_unique: isUnique,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: "Failed to track visit" });
    }

    // If it's a blog view and unique today, also increment the blog_posts.views counter
    if (blog_slug && isUnique) {
      const { data: post } = await supabase
        .from("blog_posts")
        .select("id, views")
        .eq("slug", blog_slug)
        .single();

      if (post) {
        await supabase
          .from("blog_posts")
          .update({ views: (post.views || 0) + 1 })
          .eq("id", post.id);
      }
    }

    return res.status(200).json({ success: true, is_unique: isUnique });
  } catch (err) {
    console.error("Tracking error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
