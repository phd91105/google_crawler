import _ from 'lodash';
import { Browser, connect, KnownDevices } from 'puppeteer';

import { initializePuppeteer } from '../config/puppeteer';
import { blockRessources, googleSearchUrl } from '../constants';
import { Group } from '../types';
import { cleanText } from '../utils';

// Initialize puppeteer browser
const getBrowser = () =>
  process.env.IS_LOCAL == 'true'
    ? initializePuppeteer()
    : connect({
        browserWSEndpoint: 'ws://localhost:3000',
      });

// Search on Google using query string - takes query array as parameter
export const searchOnGoogle = async (query: string[]) => {
  const browser = await getBrowser();

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

    await browser.close();

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
  const iPhone = KnownDevices['iPhone 6'];
  await page.emulate(iPhone);
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
  const data = await page.evaluate(() => {
    const htmlElement = Array.from(document.getElementsByTagName('h2')).find(
      (el) => el.textContent?.includes('Đoạn trích nổi bật từ web'),
    )?.nextElementSibling as HTMLElement;
    return htmlElement?.innerText;
  });

  // Close the browser page to prevent memory leaks
  await page.close();

  return {
    name: keyword,
    [isUsagesSearch ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};
