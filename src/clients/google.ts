import _ from 'lodash';
import { Browser, connect, HTTPRequest, KnownDevices } from 'puppeteer';

import { browserWSEndpoint } from '../config';
import { initializeBrowser } from '../config/puppeteer';
import {
  blockExt,
  blockResources,
  googleSearchUrl,
  subKeywords,
  textForElement,
} from '../constants';
import { Group, Language } from '../types';
import { cleanText, getCorrectedName, makeSearchQuery } from '../utils';

const isLocal = process.env.IS_LOCAL === 'true';

const setupBrowser = async () => {
  let browser: Browser;

  if (isLocal) {
    // Run chromium browser in headless mode
    browser = await initializeBrowser();
  } else {
    // Browserless connection mode
    // Docs: https://www.browserless.io/docs/docker
    browser = await connect({
      browserWSEndpoint,
    });
  }

  return browser;
};

const shouldBlockResource = (request: HTTPRequest) => {
  const url = request.url();

  const isBlockedResource =
    blockResources.some((type) => request.resourceType() === type) ||
    blockExt.test(url);

  return isBlockedResource ? request.abort() : request.continue();
};

const searchForItem = async (
  keyword: string,
  lang: Language,
  browser: Browser,
  isUsages = true,
) => {
  const page = await browser.newPage();

  const iPhone = KnownDevices['iPhone 5'];
  await page.emulate(iPhone);

  await page.setRequestInterception(true);
  page.on('request', shouldBlockResource);

  const searchQuery = isUsages
    ? makeSearchQuery(`${subKeywords[lang].usages}+${keyword}`)
    : makeSearchQuery(`${subKeywords[lang].sideEffects}+${keyword}`);
  await page.goto(`${googleSearchUrl(lang)}&q=${searchQuery}`);

  // Get contents of element
  const { name, data } = await page.evaluate((textForElement) => {
    const nameElement = Array.from(
      document.getElementsByTagName(textForElement.name.tag),
    ).find((el) => el.textContent?.includes(textForElement.name.content))
      ?.nextElementSibling as HTMLElement;

    const dataElement = Array.from(
      document.getElementsByTagName(textForElement.data.tag),
    ).find((el) => el.textContent?.includes(textForElement.data.content))
      ?.nextElementSibling as HTMLElement;

    return { name: nameElement?.innerText, data: dataElement?.innerText };
  }, textForElement[lang]);

  await page.close();

  return {
    keyword,
    corrected: name ? getCorrectedName(name, lang, isUsages) : keyword,
    [isUsages ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};

export const searchOnGoogle = async (
  query: string[],
  lang: Language = 'vi',
) => {
  if (_.isEmpty(query)) return [];

  // Initialize puppeteer browser
  const browser = await setupBrowser();

  try {
    const items = await Promise.all([
      ...query.map((keyword) => searchForItem(keyword, lang, browser, true)),
      ...query.map((keyword) => searchForItem(keyword, lang, browser, false)),
    ]);

    const grouped = _.groupBy(items, 'keyword');
    const result = _.values(
      _.map(grouped, (group: Group) => _.merge(...group)),
    );

    return result;
  } catch (error) {
    console.error(error);

    return [];
  } finally {
    // Close browser connection
    if (isLocal) {
      await browser.close();
    } else {
      browser.disconnect();
    }
  }
};
