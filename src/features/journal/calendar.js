import { getLanguage } from "../../shared/language.js";

const WEEKDAYS = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function weekdays() {
  return WEEKDAYS[getLanguage()] ?? WEEKDAYS.ko;
}

export function todayKey() {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month: month - 1, day };
}

export function monthLabel(year, month) {
  if (getLanguage() === "en") return `${MONTHS_EN[month]} ${year}`;
  return `${year}년 ${month + 1}월`;
}

export function formatKoreanDate(dateKey) {
  const { year, month, day } = parseDateKey(dateKey);
  const weekday = weekdays()[new Date(year, month, day).getDay()];
  if (getLanguage() === "en") {
    return `${weekday}, ${MONTHS_EN[month]} ${day}`;
  }
  return `${month + 1}월 ${day}일 (${weekday})`;
}

export function renderCalendar(root, { year, month, selectedDate, journal, onSelect }) {
  root.innerHTML = "";

  const weekRow = document.createElement("div");
  weekRow.className = "cal-weekdays";
  weekdays().forEach((name) => {
    const el = document.createElement("span");
    el.textContent = name;
    weekRow.appendChild(el);
  });
  root.appendChild(weekRow);

  const grid = document.createElement("div");
  grid.className = "cal-grid";
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayKey();

  for (let i = 0; i < firstWeekday; i += 1) {
    grid.appendChild(document.createElement("span"));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = toDateKey(year, month, day);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cal-day";
    button.textContent = String(day);
    if (key === today) button.classList.add("is-today");
    if (key === selectedDate) button.classList.add("is-selected");
    if (journal[key]?.length) button.classList.add("has-entry");
    button.addEventListener("click", () => onSelect(key));
    grid.appendChild(button);
  }

  root.appendChild(grid);
}
