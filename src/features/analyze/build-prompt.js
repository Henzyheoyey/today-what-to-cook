import { analysisItems } from "./analysis-items.js";

export function demoPayload() {
  return {
    url: "https://www.youtube.com/shorts/yeZs9dAr",
    title: "클로드 상위 1%가 돈 버는 법",
    text: "클로드 상위 1%가 돈 버는 법. 카드뉴스만 만들지 마세요. 월 수천 버는 비결, 상위 1%만 아는 영상 제작 에이전트가 가능합니다. 요즘 AI 콘텐츠가 핫한데 프롬프트를 플랫폼마다 고치느라 시간을 다 쓰죠. 한 번에 뽑아서 쇼츠로 내보내면 됩니다.",
  };
}

function scriptBlock(text, lang) {
  if (text) return text;
  return lang === "en"
    ? "No transcript found. Watch the linked video and analyze it."
    : "대본을 찾지 못했습니다. 링크의 영상을 보고 분석해 주세요.";
}

export function buildPrompt({ url, title, text }, lang) {
  const items = analysisItems(lang);
  const numbered = items
    .map((item, index) => `${index + 1}. ${item.title}\n   - ${item.ask}`)
    .join("\n\n");
  const link = url || (lang === "en" ? "(none)" : "(없음)");

  if (lang === "en") {
    const titleLine = title ? `Title: ${title}\n` : "";
    return `Analyze this short-form video.

Link: ${link}
${titleLine}
Transcript:
${scriptBlock(text, lang)}

Goal:
Do not praise views. Explain why people stopped, and how to reuse the pattern on a new topic.

Write short cards in this order:

${numbered}`;
  }

  const titleLine = title ? `제목: ${title}\n` : "";
  return `아래 숏폼 영상을 분석해 주세요.

링크: ${link}
${titleLine}
대본:
${scriptBlock(text, lang)}

목적:
조회수 자랑이 아니라, 왜 보게 됐는지와 다른 소재에 다시 쓸 수 있는 패턴을 뽑습니다.

다음 순서로, 짧고 카드처럼 정리해 주세요.

${numbered}`;
}
