import { Router, type IRouter } from "express";

const router: IRouter = Router();

// 10 default embed server URL builders — D1 through D10
function buildDefaultUrl(
  slot: number, // 0-indexed
  tmdbId: string,
  type: "movie" | "tv",
  season = 1,
  episode = 1
): string | null {
  const s = season, e = episode, id = tmdbId;
  switch (slot) {
    case 0: // D1 — VidSrc.to
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
    case 1: // D2 — VidSrc.me
      return type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
    case 2: // D3 — Embed.su
      return type === "movie"
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`;
    case 3: // D4 — 2Embed
      return type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`;
    case 4: // D5 — SmashyStream
      return type === "movie"
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}&type=tv&season=${s}&episode=${e}`;
    case 5: // D6 — VidSrc.cc
      return type === "movie"
        ? `https://vidsrc.cc/embed/movie/${id}`
        : `https://vidsrc.cc/embed/tv/${id}/${s}/${e}`;
    case 6: // D7 — VidSrc.xyz
      return type === "movie"
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`;
    case 7: // D8 — AutoEmbed
      return type === "movie"
        ? `https://autoembed.to/movie/tmdb/${id}`
        : `https://autoembed.to/tv/tmdb/${id}-${s}-${e}`;
    case 8: // D9 — MovieAPI
      return type === "movie"
        ? `https://movieapi.club/movie/${id}`
        : `https://movieapi.club/tv/${id}-${s}-${e}`;
    case 9: // D10 — Videasy
      return type === "movie"
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}?season=${s}&episode=${e}`;
    default:
      return null;
  }
}

// Resolve an admin URL template — supports {id}, {type}, {season}, {episode}
function resolveAdminTemplate(
  template: string,
  tmdbId: string,
  type: "movie" | "tv",
  season = 1,
  episode = 1
): string {
  return template
    .replace(/\{id\}/g, tmdbId)
    .replace(/\{type\}/g, type)
    .replace(/\{season\}/g, String(season))
    .replace(/\{episode\}/g, String(episode));
}

const DEFAULT_NAMES = [
  "VidSrc.to",
  "VidSrc.me",
  "Embed.su",
  "2Embed",
  "SmashyStream",
  "VidSrc.cc",
  "VidSrc.xyz",
  "AutoEmbed",
  "MovieAPI",
  "Videasy",
];

async function checkUrl(url: string, timeoutMs = 6000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
    });
    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    return false;
  }
}

// POST /api/validate-servers
// Body: { tmdbId, type, season?, episode?, adminUrls?: string[] (10 slots, empty = use default) }
router.post("/validate-servers", async (req, res) => {
  const {
    tmdbId,
    type,
    season = 1,
    episode = 1,
    adminUrls = [],
  } = req.body as {
    tmdbId: string;
    type: "movie" | "tv";
    season?: number;
    episode?: number;
    adminUrls?: string[];
  };

  if (!tmdbId || !type) {
    res.status(400).json({ error: "tmdbId and type are required" });
    return;
  }

  const checks = Array.from({ length: 10 }, async (_, i) => {
    const adminTemplate = adminUrls[i];
    const url = adminTemplate && adminTemplate.trim()
      ? resolveAdminTemplate(adminTemplate.trim(), tmdbId, type, season, episode)
      : buildDefaultUrl(i, tmdbId, type, season, episode);

    const label = `D${i + 1}`;
    const sourceName = adminTemplate?.trim()
      ? `${label} (custom)`
      : DEFAULT_NAMES[i];

    if (!url) return { id: label, name: sourceName, url: null, valid: false };
    const valid = await checkUrl(url);
    return { id: label, name: sourceName, url, valid };
  });

  const results = await Promise.all(checks);
  res.json({ servers: results });
});

// GET /api/arabic-proxy?url=ENCODED_URL
router.get("/arabic-proxy", async (req, res) => {
  const targetUrl = req.query["url"] as string;
  if (!targetUrl) {
    res.status(400).json({ error: "url query param required" });
    return;
  }
  try {
    const decoded = decodeURIComponent(targetUrl);
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);
    const upstream = await fetch(decoded, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.9",
        "Accept-Language": "ar,en;q=0.8",
        Referer: "https://google.com",
      },
    });
    const contentType = upstream.headers.get("content-type") || "text/html";
    const body = await upstream.text();
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(upstream.status).send(body);
  } catch (err: any) {
    res.status(502).json({ error: "Proxy request failed", message: err.message });
  }
});

// GET /api/m3u-proxy?url=ENCODED_URL
router.get("/m3u-proxy", async (req, res) => {
  const targetUrl = req.query["url"] as string;
  if (!targetUrl) {
    res.status(400).json({ error: "url query param required" });
    return;
  }
  try {
    const decoded = decodeURIComponent(targetUrl);
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 12000);
    const upstream = await fetch(decoded, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 IPTV-Player/1.0",
        Accept: "application/x-mpegURL,*/*",
      },
    });
    const body = await upstream.text();
    res.setHeader("Content-Type", "application/x-mpegURL");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(upstream.status).send(body);
  } catch (err: any) {
    res.status(502).json({ error: "M3U proxy failed", message: err.message });
  }
});

export default router;
