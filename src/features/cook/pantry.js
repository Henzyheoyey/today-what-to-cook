import { getLanguage } from "../../shared/language.js";

export const QUICK = [
  { ko: "달걀", en: "eggs" },
  { ko: "밥", en: "rice" },
  { ko: "양파", en: "onion" },
  { ko: "마늘", en: "garlic" },
  { ko: "대파", en: "green onion" },
  { ko: "김치", en: "kimchi" },
  { ko: "두부", en: "tofu" },
  { ko: "당근", en: "carrot" },
  { ko: "감자", en: "potato" },
  { ko: "닭가슴살", en: "chicken breast" },
  { ko: "간장", en: "soy sauce" },
  { ko: "고추장", en: "gochujang" },
];

export function quickName(item) {
  return getLanguage() === "en" ? item.en : item.ko;
}

export function hasQuickItem(ingredients, item) {
  return ingredients.includes(item.ko) || ingredients.includes(item.en);
}
