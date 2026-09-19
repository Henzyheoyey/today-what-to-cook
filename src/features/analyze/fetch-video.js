import { parseLink } from "./parse-link.js";

export async function loadVideo({ url, script }) {
  const pasted = script.trim();
  if (!url.trim() && pasted) {
    return { ok: true, platform: "paste", url: "", title: "", text: pasted, source: "paste" };
  }

  const parsed = parseLink(url);
  if (!parsed.ok) return parsed;

  const base = {
    ok: true,
    platform: parsed.platform,
    videoId: parsed.videoId ?? "",
    url: parsed.url,
    title: "",
    text: pasted,
    source: pasted ? "paste" : "link",
  };

  if (pasted || parsed.platform !== "youtube" || !parsed.videoId) return base;

  try {
    const res = await fetch(`/api/transcript?id=${encodeURIComponent(parsed.videoId)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ...base, title: data.title || "" };
    return {
      ok: true,
      platform: "youtube",
      url: parsed.url,
      title: data.title || "",
      text: data.text || "",
      source: "captions",
    };
  } catch {
    return base;
  }
}
