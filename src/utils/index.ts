import { subKeywords } from '../constants';
import { Language } from '../types';

export const cleanText = (text: string) =>
  text
    .replace(
      /(\n\n.*$|[^\\.(!?…]*(?<=)http.*$|\d.+\d{4}|mục\skhác.*$|more\sitems.*$)/is,
      '',
    )
    .trim();

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
