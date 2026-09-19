import { ko } from "./ko.js";
import { en } from "./en.js";

const dicts = { ko, en };
const STORAGE_KEY = "today-cook-lang";

export function getLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ko" || saved === "en") return saved;
  return navigator.language.startsWith("ko") ? "ko" : "en";
}

export function t(key, vars) {
  const dict = dicts[getLanguage()] ?? ko;
  let text = dict[key] ?? dicts.ko[key] ?? key;
  if (!vars) return text;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

function fillText(dict) {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const text = dict[node.dataset.i18n];
    if (text) node.textContent = text;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const text = dict[node.dataset.i18nPlaceholder];
    if (text) node.setAttribute("placeholder", text);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const text = dict[node.dataset.i18nAria];
    if (text) node.setAttribute("aria-label", text);
  });
  const desc = document.querySelector('meta[name="description"]');
  if (desc && dict["meta.description"]) {
    desc.setAttribute("content", dict["meta.description"]);
  }
}

export function applyLanguage(lang) {
  const next = lang === "en" ? "en" : "ko";
  const dict = dicts[next];
  document.documentElement.lang = next;
  document.title = dict["meta.title"];
  fillText(dict);
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.langBtn === next));
  });
  document.dispatchEvent(new CustomEvent("i18n", { detail: next }));
}

export function initLanguage() {
  applyLanguage(getLanguage());
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lang-btn]");
    if (!btn) return;
    const lang = btn.dataset.langBtn === "en" ? "en" : "ko";
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
  });
}
