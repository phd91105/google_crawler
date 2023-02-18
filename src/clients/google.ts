import _ from 'lodash';
import { Browser, connect, KnownDevices } from 'puppeteer';

import { initializePuppeteer } from '../config/puppeteer';
import { blockRessources, googleSearchUrl } from '../constants';
import { Group } from '../types';
import { cleanText } from '../utils';

// Set browser options by environment
const getBrowser = async () => {
  let browser: Browser;
  const isLocal = process.env.IS_LOCAL === 'true';

  if (isLocal) {
    // run chromium as a local browser in headless mode
    browser = await initializePuppeteer();
  } else {
    // browserless connection mode
    // run browserless chromium in docker for better performance
    // docs: https://www.browserless.io/docs/docker
    browser = await connect({
      browserWSEndpoint: 'ws://localhost:3000', // browserless/chrome socket
    });
  }

  return { browser, isLocal };
};

// Search on Google using query string - takes query array as parameter
export const searchOnGoogle = async (query: string[]) => {
  // Initialize puppeteer browser
  const { browser, isLocal } = await getBrowser();

  if (_.isEmpty(query)) return [];

  try {
    // execute all search query
    const items = await Promise.all([
      ...query.map((keyword) => searchItem(keyword, browser, true)),
      ...query.map((keyword) => searchItem(keyword, browser, false)),
    ]);

    // grouping by keyword name
    const grouped = _.groupBy(items, 'name');
    // merging all items in one object
    const merged = _.map(grouped, (group: Group) => _.merge(...group));

    return _.values(merged);
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

// Search for an item - keyword and browser are passed as parameters
export const searchItem = async (
  keyword: string,
  browser: Browser,
  isUsagesSearch = true,
) => {
  // Creating page with mobile view
  const page = await browser.newPage();

  // set emulation device
  const iPhone = KnownDevices['iPhone 5'];
  await page.emulate(iPhone);

  // Aborting requests if they matches list of blocked ressources
  await page.setRequestInterception(true);
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
  keyword = keyword.replace(/\s\t/g, '+');
  const query = isUsagesSearch
    ? `tác+dụng+${keyword}`
    : `tác+dụng+phụ+${keyword}`;
  await page.goto(`${googleSearchUrl}&q=${query}`);

  // Get contents of element
  const data = await page.evaluate(() => {
    const htmlElement = Array.from(document.getElementsByTagName('h2')).find(
      (el) => el.textContent?.includes('Đoạn trích nổi bật từ web'),
    )?.nextElementSibling as HTMLElement;
    return htmlElement?.innerText;
  });

  // Close the page to prevent memory leaks
  await page.close();

  return {
    name: keyword,
    [isUsagesSearch ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};
