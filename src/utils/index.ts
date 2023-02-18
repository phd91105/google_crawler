export const cleanText = (text: string) =>
  text
    .replace(/\n\n.*$/s, '')
    .replace(/\nhttp.*$/s, '')
    .replace(/mục\skhác.*$/is, '')
    .replace(/\n.+\d{4}/, '')
    .replace(/\d.+\d{4}/, '')
    .trim();
