import { subKeywords } from '../constants';
import { Language } from '../types';

export const cleanText = (text: string) => {
  const result = text
    .replace(/[^\\.)!?…]*(?<=)http\S.*[\n*,\s*].*$/, '')
    .replace(/\d{1,2}\s([a-zA-Z]+)\s\d{1,2},\s\d{4}.*$/, '')
    .replace(/(mục\skhác|more\sitems).+$/is, '')
    .replace(/(.*xem\stất\scả|.*view\sall)+\n/is, '')
    .replace(/\d{1}\.\d?\.?\s?/g, '')
    .trim();
  return result;
};

export const makeSearchQuery = (keyword: string) =>
  keyword.replace(/\s+/g, '+');

export const getCorrectedKeyword = (
  text: string,
  lang: Language,
  isUsages: boolean,
) => {
  if (isUsages) return text.replace(subKeywords[lang].usages, '').trim();
  else return text.replace(subKeywords[lang].sideEffects, '').trim();
};
