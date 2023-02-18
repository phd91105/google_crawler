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
  // });

  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://15.235.147.110:3000',
  });

  puppeteer.use(StealthPlugin());

  return browser;
};
