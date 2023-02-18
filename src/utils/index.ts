import { subKeywords } from '../constants';
import { Language } from '../types';

export const cleanText = (text: string) =>
  text
    .replace(/\n\n.*$/s, '')
    .replace(/http.*$/s, '')
    .replace(/mục\skhác.*$/is, '')
    .replace(/xem\stất\scả/is, '')
    .replace(/\n.+\d{4}/, '')
    .replace(/\d.+\d{4}/, '')
    .trim();

export const makeSearchQuery = (keyword: string) => keyword.replace(/\s/g, '+');

export const getCorrectedName = (
  text: string,
  lang: Language,
  isUsages: boolean,
) => {
  if (isUsages) return text.replace(subKeywords[lang].usages, '').trim();
  else return text.replace(subKeywords[lang].sideEffects, '').trim();
};
