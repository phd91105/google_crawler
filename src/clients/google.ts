import _ from 'lodash';
import { Browser, connect, HTTPRequest, KnownDevices } from 'puppeteer';

import { initializePuppeteer } from '../config/puppeteer';
import { blockResources, googleSearchUrl, subKeywords } from '../constants';
import { Group } from '../types';
import { cleanText, getCorrectedName, makeSearchQuery } from '../utils';

const isLocal = process.env.IS_LOCAL === 'true';

// Set browser options by environment
const initializeBrowser = async () => {
  let browser: Browser;

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

// determine if a resource should be blocked or allowed
const shouldBlockResource = (request: HTTPRequest) => {
  const url = request.url();

  const isBlockedResource =
    blockResources.some((type) => request.resourceType() === type) ||
    /.(jpg|jpeg|png|gif|css)$/.test(url);

  return isBlockedResource ? request.abort() : request.continue();
};

// Search for an item - keyword and browser are passed as parameters
const searchForItem = async (
  keyword: string,
  browser: Browser,
  isUsages = true,
) => {
  // Creating page with mobile view
  const page = await browser.newPage();

  // set emulation device
  const iPhone = KnownDevices['iPhone 5'];
  await page.emulate(iPhone);

  // Aborting requests if they matches list of blocked ressources
  await page.setRequestInterception(true);
  page.on('request', shouldBlockResource);

  // Go to Google and execute search query
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

  // Close the page to prevent memory leaks
  await page.close();

  return {
    keyword,
    corrected: name ? getCorrectedName(name, isUsages) : keyword,
    [isUsages ? 'usages' : 'sideEffects']: data ? cleanText(data) : null,
  };
};

// Search on Google using query string - takes query array as parameter
export const searchOnGoogle = async (query: string[]) => {
  if (_.isEmpty(query)) return [];

  // Initialize puppeteer browser
  const { browser, isLocal } = await initializeBrowser();

  try {
    // execute all search query
    const items = await Promise.all([
      ...query.map((keyword) => searchForItem(keyword, browser, true)),
      ...query.map((keyword) => searchForItem(keyword, browser, false)),
    ]);

    // grouping by keyword name
    const grouped = _.groupBy(items, 'keyword');

    // merging all items in one object
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
