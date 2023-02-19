import { executablePath, launch } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { minimalArgs } from '../constants';

export const initializeBrowser = async () => {
  const browser = await launch({
    executablePath: executablePath(),
    headless: true,
    args: minimalArgs,
  });

  puppeteer.use(StealthPlugin());
  return browser;
};
