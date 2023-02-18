import { subKeywords } from '../constants';
import { Language } from '../types';

export const cleanText = (text: string) => {
  const result = text
    .replace(/\n\n.*$/, '')
    .replace(/[^\\.(!?…]*(?<=)http\S.*[\n*,\s*].*$/, '')
    .replace(/\d{1,2}\s([a-zA-Z]+)\s\d{1,2},\s\d{4}.*$/, '')
    .replace(/mục\skhác.*$/is, '')
    .replace(/more\sitems.*$/is, '')
    .replace(/^xem\stất\scả*\n/is, '')
    .trim();
  return result;
};

export const makeSearchQuery = (keyword: string) =>
  keyword.replace(/\s+/g, '+');

export const getCorrectedName = (
  text: string,
  lang: Language,
  isUsages: boolean,
) => {
  if (isUsages) return text.replace(subKeywords[lang].usages, '').trim();
  else return text.replace(subKeywords[lang].sideEffects, '').trim();
};
