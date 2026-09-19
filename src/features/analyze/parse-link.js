const YOUTUBE = [
  /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/watch\?[^#]*v=)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
];

const PLACEHOLDERS = {
  instagram: "https://www.instagram.com/reel/",
  tiktok: "https://www.tiktok.com/",
  youtube: "https://www.youtube.com/shorts/",
  facebook: "https://www.facebook.com/reel/",
};

export function parseLink(raw) {
  const url = raw.trim();
  if (!url) return { ok: false, reason: "empty" };

  if (/instagram\.com/.test(url)) {
    return { ok: true, platform: "instagram", url };
  }
  if (/tiktok\.com/.test(url)) {
    return { ok: true, platform: "tiktok", url };
  }
  if (/facebook\.com|fb\.watch/.test(url)) {
    return { ok: true, platform: "facebook", url };
  }

  for (const pattern of YOUTUBE) {
    const match = url.match(pattern);
    if (match) {
      return { ok: true, platform: "youtube", videoId: match[1], url };
    }
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(url)) {
    return {
      ok: true,
      platform: "youtube",
      videoId: url,
      url: `https://www.youtube.com/watch?v=${url}`,
    };
  }

  return { ok: false, reason: "unsupported" };
}

export function placeholderFor(platform) {
  return PLACEHOLDERS[platform] ?? PLACEHOLDERS.youtube;
}

export function platformFromUrl(raw) {
  const parsed = parseLink(raw);
  if (!parsed.ok) return "youtube";
  return parsed.platform;
}
