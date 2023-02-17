import { createBrowserFetcher } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { minimalArgs } from "../constants";

export const initializePuppeteer = async () => {
  const browserFetcher = createBrowserFetcher();
  const revisionInfo = await browserFetcher.download("1083080");
  const browser = await puppeteer.launch({
    executablePath: revisionInfo?.executablePath,
    headless: true,
    args: minimalArgs,
  });

  puppeteer.use(StealthPlugin());

  return browser;
};
