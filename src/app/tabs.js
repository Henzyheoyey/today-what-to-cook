export function initTabs() {
  const buttons = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const page = document.querySelector("[data-page]");

  function show(tab) {
    buttons.forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.tab === tab));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab;
    });
    page.classList.toggle("is-wide", tab === "journal");
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => show(button.dataset.tab));
  });
}
