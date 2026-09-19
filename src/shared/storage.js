const STORAGE_KEY = "today-cook-v1";

export function defaultState() {
  return {
    ingredients: [],
    avoided: [],
    dishName: "",
    servings: 2,
    maxMinutes: 30,
    taste: "any",
    cuisine: "any",
    shopping: [],
    journal: {},
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return defaultState();
    return {
      ...defaultState(),
      ...saved,
      journal: saved.journal ?? {},
      shopping: saved.shopping ?? [],
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
