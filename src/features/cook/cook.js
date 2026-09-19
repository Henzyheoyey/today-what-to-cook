import { mountChips } from "./chips.js";
import { buildPrompt, canBuildPrompt } from "./prompt.js";
import { quickName } from "./pantry.js";
import { mountQuickPicks } from "./quick-picks.js";
import { renderVideoLinks } from "./video-links.js";
import { t } from "../../shared/language.js";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const promptEl = document.querySelector("[data-prompt]");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(promptEl);
    selection.removeAllRanges();
    selection.addRange(range);
    return document.execCommand("copy");
  }
}

function syncPills(group, value) {
  group.querySelectorAll("[data-value]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === value));
  });
}

export function initCook(state, persist, { onPantryChange } = {}) {
  const dishInput = document.querySelector("[data-dish-name]");
  const promptEl = document.querySelector("[data-prompt]");
  const emptyEl = document.querySelector("[data-prompt-empty]");
  const copyBtn = document.querySelector("[data-copy]");

  const ingredientChips = mountChips({
    box: document.querySelector("[data-ingredient-box]"),
    input: document.querySelector("[data-ingredient-input]"),
    getItems: () => state.ingredients,
    setItems: (items) => {
      state.ingredients = items;
      afterChange();
    },
  });

  const avoidChips = mountChips({
    box: document.querySelector("[data-avoid-box]"),
    input: document.querySelector("[data-avoid-input]"),
    getItems: () => state.avoided,
    setItems: (items) => {
      state.avoided = items;
      afterChange();
    },
  });

  function renderPrompt() {
    const ready = canBuildPrompt(state);
    emptyEl.hidden = ready;
    promptEl.hidden = !ready;
    copyBtn.disabled = !ready;
    if (ready) promptEl.textContent = buildPrompt(state);
  }

  const quickPicks = mountQuickPicks({
    state,
    onToggle: (item, on) => toggleQuick(item, on),
    onListChange: () => afterChange(),
  });

  function toggleQuick(item, on) {
    if (on) {
      state.ingredients = state.ingredients.filter(
        (name) => name !== item.ko && name !== item.en,
      );
    } else {
      const name = quickName(item);
      if (!state.ingredients.includes(name)) {
        state.ingredients = [...state.ingredients, name];
      }
    }
    afterChange();
  }

  function afterChange() {
    persist();
    refresh();
    onPantryChange?.();
  }

  function refresh() {
    ingredientChips.render();
    avoidChips.render();
    renderPrompt();
    quickPicks.render();
    renderVideoLinks(state);
  }

  function bindPills(selector, key, parse) {
    const group = document.querySelector(selector);
    group.addEventListener("click", (event) => {
      const button = event.target.closest("[data-value]");
      if (!button) return;
      state[key] = parse(button.dataset.value);
      syncPills(group, button.dataset.value);
      afterChange();
    });
    syncPills(group, String(state[key]));
  }

  dishInput.value = state.dishName;
  dishInput.addEventListener("input", () => {
    state.dishName = dishInput.value;
    afterChange();
  });

  document.querySelector("[data-clear-ingredients]").addEventListener("click", () => {
    state.ingredients = [];
    afterChange();
  });

  copyBtn.addEventListener("click", async () => {
    const copied = await copyText(buildPrompt(state));
    copyBtn.textContent = copied ? t("cook.copied") : t("cook.copyRetry");
    setTimeout(() => {
      copyBtn.textContent = t("cook.copy");
    }, 1600);
  });

  bindPills("[data-servings]", "servings", Number);
  bindPills("[data-minutes]", "maxMinutes", Number);
  bindPills("[data-taste]", "taste", (value) => value);
  bindPills("[data-cuisine]", "cuisine", (value) => value);
  document.addEventListener("i18n", refresh);
  refresh();

  return { refresh };
}
