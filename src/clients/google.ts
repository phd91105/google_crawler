import _ from "lodash";
import { Browser } from "puppeteer";
import { initializePuppeteer } from "../config/puppeteer";
import { googleSearchUrl } from "../constants";
import { Group } from "../types";

const browser = await initializePuppeteer();

export const searchOnGoogle = async (query: string[]) => {
  try {
    const items = await Promise.all([
      ...query.map((keyword) => searchItem(keyword, browser, true)),
      ...query.map((keyword) => searchItem(keyword, browser, false)),
    ]);

    const grouped = _.groupBy(items, "name");
    const merged = _.map(grouped, (group: Group) => _.merge(...group));

    return _.values(merged);
  } catch {
    return [];
  }
};

export const searchItem = async (
  keyword: string,
  browser: Browser,
  isUsagesSearch = true
) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 720, height: 1280 });
  await page.goto(googleSearchUrl);

  const inputHandle = await page.waitForXPath("//input[@name = 'q']");
  await inputHandle?.type(
    `tác dụng ${!isUsagesSearch ? "phụ" : ""} của ${keyword}`
  );

  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  const data = await page.evaluate(
    () =>
      (<HTMLElement>(
        Array.from(document.querySelectorAll("h2")).find((el) =>
          el.textContent?.includes("Đoạn trích nổi bật từ web")
        )?.nextElementSibling?.children[0]?.children[0]?.children[0]
          ?.children[0]
      ))?.innerText
  );

  await page.close();

  return {
    name: keyword,
    [isUsagesSearch ? "usages" : "sideEffects"]: data || null,
  };
};
