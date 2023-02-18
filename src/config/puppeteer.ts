// import { executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// import { minimalArgs } from '../constants';

export const initializePuppeteer = async () => {
  // const browser = await puppeteer.launch({
  //   executablePath: executablePath(),
  //   headless: true,
  //   args: [
  //     ...minimalArgs,
  //     ...(process.env.IS_LOCAL === 'true' ? [] : ['--no-sandbox']),
  //   ],
  //   userDataDir: '.cache',
  // });

  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://localhost:3000',
  });

  puppeteer.use(StealthPlugin());

  return browser;
};
