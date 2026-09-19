import { getLanguage, t } from "../../shared/language.js";

function splitNames(raw) {
  return raw
    .split(/[,，、\n]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function removeAria(name) {
  return getLanguage() === "en" ? `Remove ${name}` : `${name} 지우기`;
}

function makeChip(name, extraAction) {
  const chip = document.createElement("span");
  chip.className = extraAction ? "chip chip-shop" : "chip";
  const label = document.createElement("span");
  label.textContent = name;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.dataset.remove = name;
  remove.setAttribute("aria-label", removeAria(name));
  if (!extraAction) {
    chip.append(label, remove);
    return chip;
  }
  const extra = document.createElement("button");
  extra.type = "button";
  extra.className = extraAction.className ?? "chip-extra";
  extra.dataset.extra = name;
  extra.setAttribute("aria-label", extraAction.aria(name));
  chip.append(label, extra, remove);
  return chip;
}

export function mountChips({ box, input, getItems, setItems, extraAction }) {
  function render() {
    box.querySelectorAll(".chip").forEach((chip) => chip.remove());
    getItems().forEach((name) => box.insertBefore(makeChip(name, extraAction), input));
    const emptyKey = input.dataset.i18nPlaceholder;
    const empty = emptyKey ? t(emptyKey) : input.getAttribute("placeholder");
    input.placeholder = getItems().length > 0 ? t("chips.more") : empty;
  }

  function addMany(raw) {
    const next = [...getItems()];
    splitNames(raw).forEach((name) => {
      const exists = next.some((item) => item.toLowerCase() === name.toLowerCase());
      if (!exists) next.push(name);
    });
    setItems(next);
    render();
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addMany(input.value);
      input.value = "";
    }
    if (event.key === "Backspace" && input.value === "") {
      const items = getItems();
      if (items.length === 0) return;
      setItems(items.slice(0, -1));
      render();
    }
  });

  input.addEventListener("paste", (event) => {
    const text = event.clipboardData.getData("text");
    if (!/[,，、\n]/.test(text)) return;
    event.preventDefault();
    addMany(text);
    input.value = "";
  });

  input.addEventListener("blur", () => {
    if (!input.value.trim()) return;
    addMany(input.value);
    input.value = "";
  });

  box.addEventListener("click", (event) => {
    const extraBtn = event.target.closest("[data-extra]");
    if (extraBtn && extraAction) {
      extraAction.onClick(extraBtn.dataset.extra);
      return;
    }
    const button = event.target.closest("[data-remove]");
    if (button) {
      setItems(getItems().filter((item) => item !== button.dataset.remove));
      render();
      input.focus();
      return;
    }
    input.focus();
  });

  render();
  return { render };
}
