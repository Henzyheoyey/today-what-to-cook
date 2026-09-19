import { analysisItems } from "./analysis-items.js";
import { getLanguage } from "../../shared/language.js";

function itemCard(item, index) {
  const card = document.createElement("article");
  card.className = "item-card";
  card.innerHTML = `
    <div class="item-head">
      <span class="item-num"></span>
      <h3></h3>
      <span class="item-tag"></span>
    </div>
    <p class="item-ask"></p>
  `;
  card.querySelector(".item-num").textContent = String(index + 1).padStart(2, "0");
  card.querySelector("h3").textContent = item.title;
  card.querySelector(".item-tag").textContent = item.tag;
  card.querySelector(".item-ask").textContent = item.ask;
  return card;
}

export function renderItems(root) {
  root.innerHTML = "";
  analysisItems(getLanguage()).forEach((item, index) => {
    root.appendChild(itemCard(item, index));
  });
}
