import 'dotenv/config';

export const port = process.env.PORT || 8080;
export const origin = process.env.ORIGIN || true;

export const puppeteerBrowserWSEndpoint =
  process.env.BROWSER_WSE || 'ws://localhost:3000';

export const isLocalEnvironment = process.env.NODE_ENV === 'local';

export { instance as axios } from './axios';
export { initializeBrowser } from './puppeteer';
