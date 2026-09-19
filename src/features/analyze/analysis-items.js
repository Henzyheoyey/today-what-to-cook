export function analysisItems(lang) {
  if (lang === "en") {
    return [
      {
        title: "Why the first 3 seconds stopped the scroll",
        tag: "Hook",
        ask: "Quote the opening line or shot. Say which lever it used: secret, number, status, or a question.",
      },
      {
        title: "A hook formula you can copy",
        tag: "Formula",
        ask: "Write it as A → B → C. Example: name a trend → tease a 1% method → raise stakes with a number.",
      },
      {
        title: "Marketing design",
        tag: "Design",
        ask: "Split into target (whose desire), problem (what friction), and promise (what they get).",
      },
      {
        title: "Three things that worked",
        tag: "Hits",
        ask: "For each: a name (secret reveal, status, alternative), a one-line summary, a viewer’s inner line, and a reuse sentence with [brackets].",
      },
      {
        title: "How to move it to a new topic",
        tag: "Reuse",
        ask: "Say which slots to swap when the same formula is used on your own subject.",
      },
    ];
  }

  return [
    {
      title: "첫 3초가 멈춰 세운 이유",
      tag: "후킹",
      ask: "첫 문장이나 장면을 인용하고, 비밀·숫자·선망·질문 중 무엇을 썼는지 말하세요.",
    },
    {
      title: "복제 가능한 후킹 공식",
      tag: "공식",
      ask: "A → B → C 한 줄로 쓰세요. 예: 트렌드 언급 → 상위 1% 비결 → 숫자로 기대감.",
    },
    {
      title: "마케팅 설계",
      tag: "설계",
      ask: "타깃(누구의 욕망), 문제(어떤 불편), 약속(무엇을 주면 되는지)을 나눠 쓰세요.",
    },
    {
      title: "잘된 요소 3가지",
      tag: "요소",
      ask: "각 요소마다 이름, 한 줄 요약, 시청자 반응, 재사용 패턴([ ] 칸 문장)을 쓰세요. 예: 비결 공개, 선망성 부여, 대안 제시.",
    },
    {
      title: "다른 소재로 옮기는 법",
      tag: "재사용",
      ask: "같은 공식을 내 주제로 바꿀 때 어디를 바꿔 끼우면 되는지 알려 주세요.",
    },
  ];
}
