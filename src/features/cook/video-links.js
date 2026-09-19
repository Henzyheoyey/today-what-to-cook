import { getLanguage, t } from "../../shared/language.js";

const CUISINE_WORD = {
  korean: { ko: "한식", en: "Korean" },
  western: { ko: "양식", en: "Western" },
  japanese: { ko: "일식", en: "Japanese" },
  chinese: { ko: "중식", en: "Chinese" },
  seasia: { ko: "동남아", en: "Thai" },
};

export function searchKeyword(state) {
  const lang = getLanguage();
  const dish = state.dishName.trim();
  const base = dish || state.ingredients.slice(0, 3).join(" ");
  if (!base) return "";
  const style = dish ? "" : (CUISINE_WORD[state.cuisine]?.[lang] ?? "");
  const recipe = lang === "en" ? "recipe" : "레시피";
  return [style, base, recipe].filter(Boolean).join(" ");
}

function linksFor(keyword) {
  const query = encodeURIComponent(keyword);
  const shorts = encodeURIComponent(`${keyword} shorts`);
  return [
    { label: t("video.youtube"), url: `https://www.youtube.com/results?search_query=${query}` },
    { label: t("video.shorts"), url: `https://www.youtube.com/results?search_query=${shorts}` },
    {
      label: t("video.instagram"),
      url: `https://www.instagram.com/explore/search/keyword/?q=${query}`,
    },
  ];
}

function linkButton({ label, url }) {
  const link = document.createElement("a");
  link.className = "video-btn";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

export function renderVideoLinks(state) {
  const root = document.querySelector("[data-video-links]");
  const keywordEl = document.querySelector("[data-video-keyword]");
  const emptyEl = document.querySelector("[data-video-empty]");
  const keyword = searchKeyword(state);

  root.innerHTML = "";
  emptyEl.hidden = keyword !== "";
  keywordEl.hidden = keyword === "";
  if (!keyword) return;

  keywordEl.textContent = t("video.keyword", { q: keyword });
  linksFor(keyword).forEach((item) => root.appendChild(linkButton(item)));
}
