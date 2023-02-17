import { executablePath } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export const initializePuppeteer = async () => {
  const browser = await puppeteer.launch({
    executablePath: executablePath(),
    headless: true,
    args: ["--no-sandbox"],
  });

  puppeteer.use(StealthPlugin());

  return browser;
};
