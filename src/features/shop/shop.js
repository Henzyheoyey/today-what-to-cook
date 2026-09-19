import { mountChips } from "../cook/chips.js";
import { t } from "../../shared/language.js";

function cleanName(name) {
  return name.replace(/^BUY:\s*/i, "").trim();
}

function uniqueNames(items) {
  const seen = [];
  items.forEach((name) => {
    const exists = seen.some((item) => item.toLowerCase() === name.toLowerCase());
    if (!exists) seen.push(name);
  });
  return seen;
}

function inPantry(ingredients, name) {
  return ingredients.some((item) => item.toLowerCase() === name.toLowerCase());
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function initShop(state, persist, { onPantryChange }) {
  const emptyEl = document.querySelector("[data-shop-empty]");
  const countEl = document.querySelector("[data-shop-count]");
  const copyBtn = document.querySelector("[data-shop-copy]");

  const shopChips = mountChips({
    box: document.querySelector("[data-shop-box]"),
    input: document.querySelector("[data-shop-input]"),
    extraAction: {
      className: "chip-bought",
      aria: (name) => t("shop.boughtAria", { name }),
      onClick: markBought,
    },
    getItems: () => state.shopping,
    setItems: (items) => {
      state.shopping = uniqueNames(items.map(cleanName).filter(Boolean)).filter(
        (name) => !inPantry(state.ingredients, name),
      );
      persist();
      renderMeta();
    },
  });

  function markBought(name) {
    state.shopping = state.shopping.filter((item) => item !== name);
    if (!inPantry(state.ingredients, name)) {
      state.ingredients = [...state.ingredients, name];
    }
    persist();
    shopChips.render();
    renderMeta();
    onPantryChange();
  }

  function renderMeta() {
    const count = state.shopping.length;
    emptyEl.hidden = count > 0;
    copyBtn.disabled = count === 0;
    countEl.hidden = count === 0;
    countEl.textContent = t("shop.count", { n: String(count) });
  }

  function refresh() {
    const next = state.shopping.filter((name) => !inPantry(state.ingredients, name));
    const changed = next.length !== state.shopping.length;
    state.shopping = next;
    if (changed) persist();
    shopChips.render();
    renderMeta();
  }

  copyBtn.addEventListener("click", async () => {
    const copied = await copyText(state.shopping.join(", "));
    copyBtn.textContent = copied ? t("shop.copied") : t("cook.copyRetry");
    setTimeout(() => {
      copyBtn.textContent = t("shop.copy");
    }, 1600);
  });

  document.querySelector("[data-shop-clear]").addEventListener("click", () => {
    state.shopping = [];
    persist();
    refresh();
  });

  document.addEventListener("i18n", refresh);
  refresh();
  return { refresh };
}
