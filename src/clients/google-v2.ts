import { load } from 'cheerio';
import _ from 'lodash';

import { axios } from '../config';
import { googleSearchUrl, subKeywords, textForElement } from '../constants';
import { Language, ResponseGroup } from '../types';
import { cleanText, makeSearchQuery } from '../utils';
import { userAgent } from '../utils/user-agents';

export const searchOnGoogleV2 = async (
  queryKeywords: string[],
  lang: Language = 'vi',
) => {
  const keywordUsagesPromises = queryKeywords.map((keyword) =>
    searchForItem(keyword, lang, true),
  );
  const keywordSideEffectsPromises = queryKeywords.map((keyword) =>
    searchForItem(keyword, lang, false),
  );

  const items = await Promise.all([
    ...keywordUsagesPromises,
    ...keywordSideEffectsPromises,
  ]);

  const groupedItems = _.groupBy(items, 'keyword');
  const mergedItems = _.mapValues(groupedItems, (group: ResponseGroup) =>
    _.merge(...group),
  );
  const results = _.values(mergedItems);

  return results;
};

const searchForItem = async (
  keyword: string,
  lang: Language,
  isUsages: boolean,
) => {
  // set random nokia s40/s60 user-agent
  const randomUserAgent =
    userAgent[Math.floor(Math.random() * userAgent.length)];
  axios.defaults.headers['User-Agent'] = randomUserAgent;

  const searchQuery = isUsages
    ? makeSearchQuery(`${subKeywords[lang].usages}+${keyword}`)
    : makeSearchQuery(`${subKeywords[lang].sideEffects}+${keyword}`);

  const response = await axios.get(`${googleSearchUrl(lang)}&q=${searchQuery}`);

  const $ = load(response.data);

  let data = $('span:eq(1)').parent().parent().text();

  if (
    data.includes(textForElement[lang].name.content) ||
    data.includes(textForElement[lang].name.top)
  ) {
    data = $('span:eq(5)').parent().parent().text();
  }

  const dataIsNull = data.match(/([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+/gi);

  return {
    keyword,
    corrected: _.startCase(keyword),
    [isUsages ? 'usages' : 'sideEffects']: !dataIsNull ? cleanText(data) : null,
  };
};
