export const makePattern = (keywords: string[]) =>
  new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
