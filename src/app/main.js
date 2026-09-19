import { loadState, saveState } from "../shared/storage.js";
import { initLanguage } from "../shared/language.js";
import { initTabs } from "./tabs.js";
import { initCook } from "../features/cook/cook.js";
import { initShop } from "../features/shop/shop.js";
import { initJournal } from "../features/journal/journal.js";

const state = loadState();

function persist() {
  saveState(state);
}

initLanguage();
initTabs();

let shop;
const cook = initCook(state, persist, {
  onPantryChange: () => shop?.refresh(),
});
shop = initShop(state, persist, {
  onPantryChange: () => cook.refresh(),
});
initJournal(state, persist);
