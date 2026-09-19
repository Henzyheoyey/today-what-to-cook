import { getQuickPicks, hasQuickItem, QUICK, quickName } from "./pantry.js";
import { t } from "../../shared/language.js";

export function mountQuickPicks({ state, onToggle, onListChange }) {
  const root = document.querySelector("[data-quick]");
  const editBtn = document.querySelector("[data-quick-edit]");
  const addRow = document.querySelector("[data-quick-add]");
  const addInput = document.querySelector("[data-quick-input]");
  const resetBtn = document.querySelector("[data-quick-reset]");
  let editing = false;

  function pickChip(item) {
    const on = hasQuickItem(state.ingredients, item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-chip";
    button.textContent = quickName(item);
    button.setAttribute("aria-pressed", String(on));
    button.addEventListener("click", () => onToggle(item, on));
    return button;
  }

  function editChip(item) {
    const chip = document.createElement("span");
    chip.className = "quick-chip is-editing";
    chip.append(quickName(item));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quick-remove";
    remove.setAttribute("aria-label", t("cook.quickRemove", { name: quickName(item) }));
    remove.addEventListener("click", () => removePick(item));
    chip.appendChild(remove);
    return chip;
  }

  function removePick(item) {
    state.quickPicks = getQuickPicks(state).filter((pick) => pick.ko !== item.ko);
    onListChange();
  }

  function addPick(raw) {
    const name = raw.trim();
    if (!name) return;
    const taken = getQuickPicks(state).some((pick) => quickName(pick) === name);
    if (taken) return;
    state.quickPicks = [...getQuickPicks(state), { ko: name, en: name }];
    onListChange();
  }

  function render() {
    root.innerHTML = "";
    addRow.hidden = !editing;
    editBtn.textContent = editing ? t("cook.quickDone") : t("cook.quickEdit");
    getQuickPicks(state).forEach((item) => {
      root.appendChild(editing ? editChip(item) : pickChip(item));
    });
  }

  editBtn.addEventListener("click", () => {
    editing = !editing;
    render();
    if (editing) addInput.focus();
  });

  addInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addPick(addInput.value);
    addInput.value = "";
  });

  resetBtn.addEventListener("click", () => {
    state.quickPicks = [...QUICK];
    onListChange();
  });

  return { render };
}
