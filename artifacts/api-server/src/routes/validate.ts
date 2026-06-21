import { Router, type IRouter } from "express";

const router: IRouter = Router();

// The 9 embed server URL builders — mirrors what the frontend uses
function buildEmbedUrl(
  serverId: string,
  tmdbId: string,
  type: "movie" | "tv",
  season = 1,
  episode = 1
): string | null {
  const s = season, e = episode, id = tmdbId;
  switch (serverId) {
    case "vidsrc-to":
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
    case "vidsrc-me":
      return type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
    case "embed-su":
      return type === "movie"
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`;
    case "2embed":
      return type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`;
    case "smashystream":
      return type === "movie"
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}&type=tv&season=${s}&episode=${e}`;
    case "vidsrc-cc":
      return type === "movie"
        ? `https://vidsrc.cc/embed/movie/${id}`
        : `https://vidsrc.cc/embed/tv/${id}/${s}/${e}`;
    case "vidsrc-xyz":
      return type === "movie"
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`;
    case "autoembed":
      return type === "movie"
        ? `https://autoembed.to/movie/tmdb/${id}`
        : `https://autoembed.to/tv/tmdb/${id}-${s}-${e}`;
    case "movieapi":
      return type === "movie"
        ? `https://movieapi.club/movie/${id}`
        : `https://movieapi.club/tv/${id}-${s}-${e}`;
    default:
      return null;
  }
}

const ALL_SERVER_IDS = [
  "vidsrc-to",
  "vidsrc-me",
  "embed-su",
  "2embed",
  "smashystream",
  "vidsrc-cc",
  "vidsrc-xyz",
  "autoembed",
  "movieapi",
];

const SERVER_NAMES: Record<string, string> = {
  "vidsrc-to": "VidSrc To",
  "vidsrc-me": "VidSrc Me",
  "embed-su": "Embed Su",
  "2embed": "2Embed",
  "smashystream": "SmashyStream",
  "vidsrc-cc": "VidSrc CC",
  "vidsrc-xyz": "VidSrc XYZ",
  "autoembed": "AutoEmbed",
  "movieapi": "MovieAPI",
};

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
    // Accept 200, 301, 302 — redirect means the server is alive
    return res.status < 500;
  } catch {
    return false;
  }
}

// POST /api/validate-servers
// Body: { tmdbId: string, type: "movie"|"tv", season?: number, episode?: number }
// Returns: { servers: Array<{ id, name, url, valid }> }
router.post("/validate-servers", async (req, res) => {
  const { tmdbId, type, season = 1, episode = 1 } = req.body as {
    tmdbId: string;
    type: "movie" | "tv";
    season?: number;
    episode?: number;
  };

  if (!tmdbId || !type) {
    res.status(400).json({ error: "tmdbId and type are required" });
    return;
  }

  const checks = ALL_SERVER_IDS.map(async (id) => {
    const url = buildEmbedUrl(id, tmdbId, type, season, episode);
    if (!url) return { id, name: SERVER_NAMES[id], url: null, valid: false };
    const valid = await checkUrl(url);
    return { id, name: SERVER_NAMES[id], url, valid };
  });

  const results = await Promise.all(checks);
  res.json({ servers: results });
});

// GET /api/arabic-proxy?url=ENCODED_URL
// Simple CORS proxy for Arabic content sites
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
// Proxy for M3U playlist fetching (CORS)
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
