import { executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { minimalArgs } from '../constants';

export const initializePuppeteer = async () => {
  const browser = await puppeteer.launch({
    executablePath: executablePath(),
    headless: true,
    args: [
      ...minimalArgs,
      ...(process.env.IS_LOCAL === 'true' ? [] : ['--no-sandbox']),
    ],
    userDataDir: '.cache',
  });

  puppeteer.use(StealthPlugin());

  return browser;
};
