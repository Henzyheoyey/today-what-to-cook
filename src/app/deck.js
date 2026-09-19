import { t } from "../shared/language.js";

const NAMES = ["cook", "analyze"];

function isDeck(name) {
  return NAMES.includes(name);
}

export function initDeck() {
  const buttons = document.querySelectorAll(".deck-tab");
  const panels = document.querySelectorAll("[data-deck-panel]");
  const page = document.querySelector("[data-page]");

  function titleFor(name) {
    return name === "analyze" ? t("analyze.metaTitle") : t("meta.title");
  }

  function show(name) {
    if (!isDeck(name)) name = "cook";
    buttons.forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.deck === name));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.deckPanel !== name;
    });
    document.body.dataset.deck = name;
    document.title = titleFor(name);
    const journalOn =
      name === "cook" &&
      document.querySelector("[data-tab][aria-selected='true']")?.dataset.tab === "journal";
    page.classList.toggle("is-wide", journalOn);
    if (location.hash !== `#${name}`) {
      history.replaceState(null, "", `#${name}`);
    }
    window.scrollTo({ top: 0 });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => show(button.dataset.deck));
  });
  window.addEventListener("hashchange", () => {
    show(location.hash.slice(1));
  });
  document.addEventListener("i18n", () => {
    document.title = titleFor(document.body.dataset.deck);
  });

  show(location.hash.slice(1) || "cook");
}
