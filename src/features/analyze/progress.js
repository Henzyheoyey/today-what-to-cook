import { t } from "../../shared/language.js";

const STEPS = [
  { key: "analyze.progressCheck", to: 18 },
  { key: "analyze.progressScript", to: 52 },
  { key: "analyze.progressHook", to: 78 },
  { key: "analyze.progressReuse", to: 94 },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function playProgress(root) {
  const box = root.querySelector("[data-progress]");
  const label = root.querySelector("[data-progress-label]");
  const pct = root.querySelector("[data-progress-pct]");
  const bar = root.querySelector("[data-progress-bar]");
  box.hidden = false;

  for (const step of STEPS) {
    label.textContent = t(step.key);
    pct.textContent = `${step.to}%`;
    bar.style.width = `${step.to}%`;
    await sleep(160);
  }

  return function finishProgress() {
    pct.textContent = "100%";
    bar.style.width = "100%";
  };
}

export function hideProgress(root) {
  root.querySelector("[data-progress]").hidden = true;
  root.querySelector("[data-progress-bar]").style.width = "0%";
}
