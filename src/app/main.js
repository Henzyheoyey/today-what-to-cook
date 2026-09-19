import { loadState, saveState } from "../shared/storage.js";
import { initLanguage, t } from "../shared/language.js";
import { initDeck } from "./deck.js";
import { initTabs } from "./tabs.js";
import { initCook } from "../features/cook/cook.js";
import { initShop } from "../features/shop/shop.js";
import { initJournal } from "../features/journal/journal.js";
import { initAnalyze } from "../features/analyze/analyze.js";

const state = loadState();

function persist() {
  if (saveState(state)) return;
  alert(t("storage.full"));
}

initLanguage();
initDeck();
initTabs();

let shop;
const cook = initCook(state, persist, {
  onPantryChange: () => shop?.refresh(),
});
shop = initShop(state, persist, {
  onPantryChange: () => cook.refresh(),
});
initJournal(state, persist);
initAnalyze();
