import _ from 'lodash';
import { Browser, connect, HTTPRequest, KnownDevices } from 'puppeteer';

import { initializeBrowser } from '../config/puppeteer';
import {
  blockExt,
  blockResources,
  googleSearchUrl,
  subKeywords,
} from '../constants';
import { Group } from '../types';
import { cleanText, getCorrectedName, makeSearchQuery } from '../utils';

const isLocal = process.env.IS_LOCAL === 'true';

const setupBrowser = async () => {
  let browser: Browser;

  if (isLocal) {
    // run chromium browser in headless mode
    browser = await initializeBrowser();
  } else {
    // browserless connection mode
    // docs: https://www.browserless.io/docs/docker
    browser = await connect({
      browserWSEndpoint: 'ws://localhost:3000', // docker:browserless/chrome socket
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
  browser: Browser,
  isUsages = true,
) => {
  const page = await browser.newPage();

  const iPhone = KnownDevices['iPhone 5'];
  await page.emulate(iPhone);

  await page.setRequestInterception(true);
  page.on('request', shouldBlockResource);

  const searchQuery = isUsages
    ? makeSearchQuery(`${subKeywords.usages}+${keyword}`)
    : makeSearchQuery(`${subKeywords.sideEffects}+${keyword}`);
  await page.goto(`${googleSearchUrl}&q=${searchQuery}`);

  // Get contents of element
  const { name, data } = await page.evaluate(() => {
    const nameElement = Array.from(document.getElementsByTagName('span')).find(
      (el) => el.textContent?.includes('hiển thị kết quả cho'),
    )?.nextElementSibling;
    const dataElement = Array.from(document.getElementsByTagName('h2')).find(
      (el) => el.textContent?.includes('nổi bật'),
    )?.nextElementSibling;

    return { name: nameElement?.textContent, data: dataElement?.textContent };
  });

  await page.close();

  return {
    keyword,
    corrected: name ? getCorrectedName(name, isUsages) : keyword,
    [isUsages ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};

export const searchOnGoogle = async (query: string[]) => {
  if (_.isEmpty(query)) return [];

  // Initialize puppeteer browser
  const browser = await setupBrowser();

  try {
    const items = await Promise.all([
      ...query.map((keyword) => searchForItem(keyword, browser, true)),
      ...query.map((keyword) => searchForItem(keyword, browser, false)),
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
    // close browser connection
    if (isLocal) {
      await browser.close();
    } else {
      browser.disconnect();
    }
  }
};
