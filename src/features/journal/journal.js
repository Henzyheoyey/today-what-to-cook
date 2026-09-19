import {
  formatKoreanDate,
  monthLabel,
  parseDateKey,
  renderCalendar,
  todayKey,
} from "./calendar.js";
import { dishCard, dishesOn, recentDishes } from "./journal-list.js";
import { t } from "../../shared/language.js";

export function initJournal(state, persist) {
  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let selectedDate = todayKey();
  let editingId = null;

  const calendarRoot = document.querySelector("[data-calendar]");
  const monthEl = document.querySelector("[data-month-label]");
  const dayTitle = document.querySelector("[data-day-title]");
  const dayList = document.querySelector("[data-day-list]");
  const emptyEl = document.querySelector("[data-day-empty]");
  const form = document.querySelector("[data-day-form]");
  const saveBtn = document.querySelector("[data-save-dish]");
  const cancelBtn = document.querySelector("[data-cancel-edit]");
  const recentRoot = document.querySelector("[data-recent]");

  function paint() {
    monthEl.textContent = monthLabel(viewYear, viewMonth);
    dayTitle.textContent = formatKoreanDate(selectedDate);
    renderCalendar(calendarRoot, {
      year: viewYear,
      month: viewMonth,
      selectedDate,
      journal: state.journal,
      onSelect: selectDate,
    });
    renderDay();
    renderRecent();
  }

  function selectDate(dateKey) {
    selectedDate = dateKey;
    resetForm();
    paint();
  }

  function resetForm() {
    editingId = null;
    form.reset();
    saveBtn.textContent = t("journal.save");
    cancelBtn.hidden = true;
  }

  function renderDay() {
    const dishes = dishesOn(state, selectedDate);
    emptyEl.hidden = dishes.length > 0;
    dayList.innerHTML = "";
    dishes.forEach((dish) => {
      dayList.appendChild(
        dishCard(dish, { onEdit: startEdit, onDelete: removeDish }),
      );
    });
  }

  function startEdit(dish) {
    editingId = dish.id;
    form.title.value = dish.title;
    form.recipe.value = dish.recipe;
    form.note.value = dish.note;
    saveBtn.textContent = t("journal.saveEdit");
    cancelBtn.hidden = false;
    form.title.focus();
  }

  function removeDish(id) {
    const next = dishesOn(state, selectedDate).filter((dish) => dish.id !== id);
    if (next.length === 0) delete state.journal[selectedDate];
    else state.journal[selectedDate] = next;
    if (editingId === id) resetForm();
    persist();
    paint();
  }

  function renderRecent() {
    const items = recentDishes(state.journal);
    recentRoot.hidden = items.length === 0;
    const list = recentRoot.querySelector("[data-recent-list]");
    list.innerHTML = "";
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recent-item";
      button.innerHTML = `<strong></strong><span></span>`;
      button.querySelector("strong").textContent = item.title;
      button.querySelector("span").textContent = formatKoreanDate(item.date);
      button.addEventListener("click", () => jumpTo(item.date));
      list.appendChild(button);
    });
  }

  function jumpTo(dateKey) {
    const parsed = parseDateKey(dateKey);
    viewYear = parsed.year;
    viewMonth = parsed.month;
    selectDate(dateKey);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = form.title.value.trim();
    if (!title) return;
    const entry = {
      id: editingId ?? crypto.randomUUID(),
      title,
      recipe: form.recipe.value.trim(),
      note: form.note.value.trim(),
    };
    const current = dishesOn(state, selectedDate);
    state.journal[selectedDate] = editingId
      ? current.map((dish) => (dish.id === editingId ? entry : dish))
      : [...current, entry];
    persist();
    resetForm();
    paint();
  });

  cancelBtn.addEventListener("click", resetForm);
  document.addEventListener("i18n", () => {
    if (editingId) saveBtn.textContent = t("journal.saveEdit");
    else saveBtn.textContent = t("journal.save");
    paint();
  });
  document.querySelector("[data-prev-month]").addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    paint();
  });
  document.querySelector("[data-next-month]").addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    paint();
  });

  paint();
}
