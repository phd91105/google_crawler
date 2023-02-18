import { subKeywords } from '../constants';
import { Language } from '../types';

export const cleanText = (text: string) =>
  text
    .replace(
      /(\n\n.*$|[^.?!]*(?<=[.?\s!])http.*$|mục\skhác.*$|xem\stất\scả|more\sitems*$|\n.+\d{4}|\d.+\d{4})/is,
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
