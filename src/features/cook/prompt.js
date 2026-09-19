import { getLanguage } from "../../shared/language.js";

function joined(items, none) {
  if (items.length === 0) return none;
  return items.join(", ");
}

function cuisineLine(state, lang) {
  const ko = {
    korean: "한식 분위기",
    western: "양식 분위기",
    japanese: "일식 분위기",
    chinese: "중식 분위기",
    seasia: "동남아 분위기",
    any: "분위기는 자유롭게",
  };
  const en = {
    korean: "Korean-style",
    western: "Western-style",
    japanese: "Japanese-style",
    chinese: "Chinese-style",
    seasia: "Southeast Asian-style",
    any: "any cuisine is fine",
  };
  return (lang === "en" ? en : ko)[state.cuisine] ?? (lang === "en" ? en.any : ko.any);
}

function tasteLine(state, lang) {
  const ko = { mild: "담백하게", spicy: "매콤하게", any: "맛은 자유롭게" };
  const en = { mild: "mild", spicy: "spicy", any: "any flavor" };
  return (lang === "en" ? en : ko)[state.taste] ?? (lang === "en" ? en.any : ko.any);
}

function videoSection(lang) {
  if (lang === "en") {
    return `[Video references]
- Name up to 3 popular YouTube or Instagram videos for this dish: title, channel or creator, why it's worth watching
- Only paste a link if you are sure it is real. If not, give the search words instead of a link`;
  }
  return `[영상 참고]
- 이 요리로 많이 본 유튜브 / 인스타 영상을 3개까지 알려 주세요: 제목, 채널이나 계정 이름, 볼 만한 이유
- 링크는 확실한 것만 적어 주세요. 확실하지 않으면 링크 대신 검색어를 적어 주세요`;
}

function conditionLines(state, lang) {
  const time =
    state.maxMinutes === 0
      ? lang === "en" ? "no time limit" : "시간 제한 없음"
      : lang === "en"
        ? `within ${state.maxMinutes} minutes`
        : `${state.maxMinutes}분 이내`;
  const servings = lang === "en" ? `${state.servings} servings` : `${state.servings}인분`;
  return `- ${servings}\n- ${time}\n- ${tasteLine(state, lang)}\n- ${cuisineLine(state, lang)}`;
}

function ideaPrompt(state, lang) {
  const none = lang === "en" ? "none" : "없음";
  if (lang === "en") {
    return `You are a home cook. Suggest dishes I can make with what I have. Only ask for extra ingredients if they are truly needed.

[Ingredients I have]
${joined(state.ingredients, none)}

[Avoid / allergies]
${joined(state.avoided, none)}

[Constraints]
${conditionLines(state, lang)}

[Output]
1. Three dishes I can make now: name, one-line reason, difficulty (easy/medium)
2. For each dish, list missing ingredients separately — do not repeat what I already have
3. Full recipe for the top pick (prep → steps → heat → time)
4. End with one line of missing items only, comma-separated, prefixed with BUY:

${videoSection(lang)}

Use spoons and grams so a beginner can follow.`;
  }
  return `당신은 집밥 요리사입니다. 지금 있는 재료로 바로 해먹을 수 있는 요리를 골라 주세요. 없는 재료는 꼭 필요할 때만 최소로 제안하세요.

[있는 재료]
${joined(state.ingredients, none)}

[빼고 싶은 재료 / 알러지]
${joined(state.avoided, none)}

[조건]
${conditionLines(state, lang)}

[출력]
1. 바로 가능한 요리 3가지: 이름, 한 줄 이유, 난이도(쉬움/보통)
2. 각 요리에서 부족한 재료만 따로 표시. 이미 있는 재료는 반복하지 마세요
3. 가장 추천하는 1가지의 자세한 레시피 (손질 → 순서 → 불 세기 → 대략 시간)
4. 마지막에 사야 하는 재료만 한 줄로, 쉼표로 나눠 BUY: 뒤에 적어 주세요

${videoSection(lang)}

초보자도 따라 할 수 있게, 계량은 큰술/작은술과 g를 함께 적어 주세요.`;
}

function recipePrompt(state, dishName, lang) {
  const none = lang === "en" ? "none" : "없음";
  if (lang === "en") {
    return `You are a home cook. Give me a recipe for "${dishName}". Use what I have, and tell me only what I still need to buy.

[Dish]
${dishName}

[Ingredients I have]
${joined(state.ingredients, none)}

[Avoid / allergies]
${joined(state.avoided, none)}

[Constraints]
${conditionLines(state, lang)}

[Output]
1. Ingredient list marked have / buy
2. Easy swaps if something is missing
3. Full recipe (prep → steps → heat → plating)
4. Two tips so it doesn't fail
5. End with missing items only, comma-separated, prefixed with BUY:

${videoSection(lang)}

Use spoons and grams so a beginner can follow.`;
  }
  return `당신은 집밥 요리사입니다. "${dishName}" 레시피를 알려 주세요. 있는 재료를 최대한 쓰고, 없는 것만 사라고 적어 주세요.

[만들고 싶은 요리]
${dishName}

[있는 재료]
${joined(state.ingredients, none)}

[빼고 싶은 재료 / 알러지]
${joined(state.avoided, none)}

[조건]
${conditionLines(state, lang)}

[출력]
1. 필요한 재료 목록 (있음 / 사야 함 표시)
2. 대체 가능한 재료가 있으면 알려 주기
3. 자세한 레시피 (손질 → 순서 → 불 세기 → 플레이팅)
4. 실패하지 않는 팁 2가지
5. 마지막에 사야 하는 재료만 한 줄로, 쉼표로 나눠 BUY: 뒤에 적어 주세요

${videoSection(lang)}

초보자도 따라 할 수 있게, 계량은 큰술/작은술과 g를 함께 적어 주세요.`;
}

export function buildPrompt(state) {
  const lang = getLanguage();
  const dishName = state.dishName.trim();
  if (dishName) return recipePrompt(state, dishName, lang);
  return ideaPrompt(state, lang);
}

export function canBuildPrompt(state) {
  return state.ingredients.length > 0 || state.dishName.trim() !== "";
}
