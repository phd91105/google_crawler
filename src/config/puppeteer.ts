import { executablePath, launch } from 'puppeteer';

import { minimalArgs } from '../constants';

export const initializeBrowser = async () => {
  const browser = await launch({
    executablePath: executablePath(),
    headless: true,
    args: minimalArgs,
  });

  return browser;
};
