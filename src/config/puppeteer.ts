import { Browser, connect, executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { minimalArgs } from '../constants';
import { isLocalEnvironment, puppeteerBrowserWSEndpoint } from './index';

export const initializeBrowser = async () => {
  let browser: Browser;

  if (isLocalEnvironment) {
    // Run chromium browser in headless mode
    browser = await puppeteer.launch({
      executablePath: executablePath(),
      headless: true,
      args: minimalArgs,
    });

    puppeteer.use(StealthPlugin());
  } else {
    // Browserless connection mode
    // Docs: https://www.browserless.io/docs/docker
    browser = await connect({
      browserWSEndpoint: puppeteerBrowserWSEndpoint,
    });
  }

  return browser;
};
