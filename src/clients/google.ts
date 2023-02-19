import _ from 'lodash';
import { Browser, HTTPRequest } from 'puppeteer';
import UserAgent from 'user-agents';

import { initializeBrowser, isLocalEnvironment } from '../config';
import {
  blockedExtensions,
  blockedResourceTypes,
  googleSearchUrl,
  subKeywords,
  textForElement,
} from '../constants';
import { Error, Language, ResponseGroup } from '../types';
import { cleanText, getCorrectedKeyword, makeSearchQuery } from '../utils';

const shouldBlockRequest = (request: HTTPRequest) => {
  const url = request.url();

  const isBlockedResource =
    blockedResourceTypes.some((type) => request.resourceType() === type) ||
    blockedExtensions.test(url);

  return isBlockedResource ? request.abort() : request.continue();
};

const searchForItem = async (
  keyword: string,
  lang: Language,
  browser: Browser,
  isUsages: boolean,
) => {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(90 * 1000);

  // Set random user-agent to avoid Google reCaptcha
  const mobileUserAgent = new UserAgent({ deviceCategory: 'mobile' });

  await page.setUserAgent(mobileUserAgent.toString());
  await page.setViewport({
    width: mobileUserAgent.data.viewportWidth,
    height: mobileUserAgent.data.viewportHeight,
  });

  await page.setRequestInterception(true);
  page.on('request', shouldBlockRequest);

  const searchQuery = isUsages
    ? makeSearchQuery(`${subKeywords[lang].usages}+${keyword}`)
    : makeSearchQuery(`${subKeywords[lang].sideEffects}+${keyword}`);
  await page.goto(`${googleSearchUrl(lang)}&q=${searchQuery}`);

  // Get contents of element
  const { name, data } = await page.evaluate((textForElement) => {
    const nameElement = Array.from(
      document.getElementsByTagName(textForElement.name.tag),
    ).find((element) =>
      element.textContent?.includes(textForElement.name.content),
    )?.nextElementSibling as HTMLElement;

    const dataElement = Array.from(
      document.getElementsByTagName(textForElement.data.tag),
    ).find((element) =>
      element.textContent?.includes(textForElement.data.content),
    )?.nextElementSibling as HTMLElement;

    return { name: nameElement?.innerText, data: dataElement?.innerText };
  }, textForElement[lang]);

  const corrected = name ? getCorrectedKeyword(name, lang, isUsages) : keyword;

  await page.close();

  return {
    keyword,
    corrected: _.startCase(corrected),
    [isUsages ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};

export const searchOnGoogle = async (
  queryKeywords: string[],
  lang: Language = 'vi',
) => {
  if (_.isEmpty(queryKeywords)) return [];

  // Initialize puppeteer browser
  const browser = await initializeBrowser();

  try {
    const keywordUsagesPromises = queryKeywords.map((keyword) =>
      searchForItem(keyword, lang, browser, true),
    );
    const keywordSideEffectsPromises = queryKeywords.map((keyword) =>
      searchForItem(keyword, lang, browser, false),
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
  } catch (error) {
    throw new Error((<Error>error).message);
  } finally {
    // Close browser connection
    if (isLocalEnvironment) {
      await browser.close();
    } else {
      browser.disconnect();
    }
  }
};
