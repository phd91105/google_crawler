import { subKeywords } from '../constants';
import { Language } from '../types';

export const cleanText = (text: string): string => {
  return text
    .replace(/[^.)!?…](?<=)http\S.*[\n*,\s*].*$/, '') // Remove URLs.
    .replace(/\d{1,2}\s([a-zA-Z]+)\s\d{1,2},\s\d{4}.*$/, '') // Remove dates.
    .replace(/(mục\skhác|more\sitems).+$/i, '') // Remove "more items".
    .replace(/(.*xem\stất\scả|.*view\sall)+\n/i, '') // Remove "view all".
    .replace(/<[/]?\w+>|[\d+]/g, '') // Remove HTML tags and numbers.
    .replace(/\.\.\./g, '') // Remove ellipsises.
    .replace(/(\s*[.,]\s*)+/g, '$1') // Replace consecutive white spaces with a single space.
    .trim(); // Remove leading/trailing white spaces.
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
