export const makePattern = (keywords: string[]) =>
  new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

export const cleanText = (text: string) => {
  return text.replace(/(<[/]?\w+>)|(\[\d+\])/g, "").trim();
};
