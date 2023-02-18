import _ from 'lodash';
import { Browser } from 'puppeteer';

import { initializePuppeteer } from '../config/puppeteer';
import { blockRessources, googleSearchUrl } from '../constants';
import { Group } from '../types';
import { cleanText } from '../utils';

// Initialize puppeteer browser
const browser = await initializePuppeteer();

// Search on Google using query string - takes query array as parameter
export const searchOnGoogle = async (query: string[]) => {
  if (_.isEmpty(query)) return [];

  try {
    const items = await Promise.all([
      ...query.map((keyword) => searchItem(keyword, browser, true)),
      ...query.map((keyword) => searchItem(keyword, browser, false)),
    ]);

    // grouping by keyword name
    const grouped = _.groupBy(items, 'name');
    // merging all items in one object
    const merged = _.map(grouped, (group: Group) => _.merge(...group));

    return _.values(merged);
  } catch {
    return [];
  }
};

// Search for an item - keyword and browser are passed as parameters
export const searchItem = async (
  keyword: string,
  browser: Browser,
  isUsagesSearch = true,
) => {
  // Creating page with mobile view
  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320, isMobile: true });
  await page.setRequestInterception(true);

  // Aborting requests if they matches list of blocked ressources
  page.on('request', (request) => {
    const url = request.url();
    const isBlockedResource =
      blockRessources.includes(request.resourceType()) ||
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.png') ||
      url.includes('.gif') ||
      url.includes('.css');
    isBlockedResource ? request.abort() : request.continue();
  });

  // Go to Google and execute search query
  const query = !isUsagesSearch
    ? `tác+dụng+phụ+${keyword.replace(/\s/g, '+')}`
    : `tác+dụng+${keyword.replace(/\s/g, '+')}`;
  await page.goto(`${googleSearchUrl}&q=${query}`);

  // Get contents of element
  const data = await page.evaluate(
    () =>
      (<HTMLElement>(
        Array.from(document.getElementsByTagName('h2')).find((el) =>
          el.textContent?.includes('Đoạn trích nổi bật từ web'),
        )?.nextElementSibling?.children[0]?.children[0]?.children[0]
          ?.children[0]
      ))?.innerText,
  );

  // Close the browser page to prevent memory leaks
  await page.close();

  return {
    name: keyword,
    [isUsagesSearch ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};
