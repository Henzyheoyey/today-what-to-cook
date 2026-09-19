import { t } from "../../shared/language.js";

export function dishesOn(state, dateKey) {
  return state.journal[dateKey] ?? [];
}

export function recentDishes(journal) {
  return Object.entries(journal)
    .flatMap(([date, items]) => items.map((item) => ({ ...item, date })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
}

export function dishCard(dish, { onEdit, onDelete }) {
  const article = document.createElement("article");
  article.className = "cooked-item";
  article.innerHTML = `
    <div class="cooked-head">
      <h3></h3>
      <div class="item-actions">
        <button type="button" class="ghost-btn" data-edit></button>
        <button type="button" class="ghost-btn" data-delete></button>
      </div>
    </div>
    <img class="cooked-photo" alt="" />
    <p class="cooked-note"></p>
    <pre class="cooked-recipe"></pre>
  `;
  article.querySelector("h3").textContent = dish.title;
  const photo = article.querySelector(".cooked-photo");
  photo.hidden = !dish.photo;
  if (dish.photo) {
    photo.src = dish.photo;
    photo.alt = t("journal.photoAlt", { title: dish.title });
  }
  article.querySelector("[data-edit]").textContent = t("journal.edit");
  article.querySelector("[data-delete]").textContent = t("journal.delete");
  const note = article.querySelector(".cooked-note");
  note.hidden = !dish.note;
  note.textContent = dish.note;
  const recipe = article.querySelector(".cooked-recipe");
  recipe.hidden = !dish.recipe;
  recipe.textContent = dish.recipe;
  article.querySelector("[data-edit]").addEventListener("click", () => onEdit(dish));
  article.querySelector("[data-delete]").addEventListener("click", () => onDelete(dish.id));
  return article;
}
