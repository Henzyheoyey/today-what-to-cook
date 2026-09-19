import { buildPrompt, demoPayload } from "./build-prompt.js";
import { copyText, selectText } from "../../shared/clipboard.js";
import { getLanguage, t } from "../../shared/language.js";
import { hideProgress, playProgress } from "./progress.js";
import { loadVideo } from "./fetch-video.js";
import { parseLink, placeholderFor, platformFromUrl } from "./parse-link.js";
import { renderItems } from "./render-items.js";

export function initAnalyze() {
  const form = document.querySelector("[data-analyze-form]");
  const urlInput = document.querySelector("[data-url]");
  const scriptInput = document.querySelector("[data-script]");
  const status = document.querySelector("[data-status]");
  const itemsRoot = document.querySelector("[data-items]");
  const promptEl = document.querySelector("[data-analyze-prompt]");
  const emptyEl = document.querySelector("[data-analyze-empty]");
  const copyBtn = document.querySelector("[data-analyze-copy]");
  const submitBtn = form.querySelector('[type="submit"]');
  let payload = null;

  function currentPrompt() {
    return payload ? buildPrompt(payload, getLanguage()) : "";
  }

  function renderPrompt() {
    const text = currentPrompt();
    emptyEl.hidden = Boolean(text);
    promptEl.hidden = !text;
    copyBtn.disabled = !text;
    promptEl.textContent = text;
  }

  function markPlatform(platform) {
    document.querySelectorAll("[data-platform]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.platform === platform));
    });
  }

  function findError() {
    const url = urlInput.value.trim();
    if (!url && !scriptInput.value.trim()) return t("analyze.errEmpty");
    if (url && !parseLink(url).ok) return t("analyze.errUnsupported");
    return "";
  }

  async function run(kind) {
    status.hidden = true;
    const error = kind === "demo" ? "" : findError();
    if (error) {
      status.hidden = false;
      status.textContent = error;
      return;
    }
    submitBtn.disabled = true;
    const progress = playProgress(document);
    try {
      payload =
        kind === "demo"
          ? demoPayload()
          : await loadVideo({ url: urlInput.value, script: scriptInput.value });
      if (kind === "demo") {
        urlInput.value = payload.url;
        markPlatform("youtube");
      }
      (await progress)();
      renderPrompt();
    } finally {
      submitBtn.disabled = false;
      setTimeout(() => hideProgress(document), 600);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run("link");
  });

  document.querySelector("[data-demo]").addEventListener("click", () => run("demo"));

  document.querySelector("[data-script-toggle]").addEventListener("click", () => {
    const box = document.querySelector("[data-script-box]");
    box.hidden = !box.hidden;
  });

  document.querySelector("[data-platforms]").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-platform]");
    if (!btn) return;
    markPlatform(btn.dataset.platform);
    if (!urlInput.value.trim()) urlInput.placeholder = placeholderFor(btn.dataset.platform);
  });

  urlInput.addEventListener("input", () => markPlatform(platformFromUrl(urlInput.value)));

  copyBtn.addEventListener("click", async () => {
    const copied = await copyText(currentPrompt());
    if (!copied) selectText(promptEl);
    copyBtn.textContent = copied ? t("analyze.copied") : t("analyze.copyRetry");
    setTimeout(() => {
      copyBtn.textContent = t("analyze.copy");
    }, 1600);
  });

  document.addEventListener("i18n", () => {
    renderItems(itemsRoot);
    renderPrompt();
  });

  renderItems(itemsRoot);
  renderPrompt();
}
