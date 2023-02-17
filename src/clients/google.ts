import _ from "lodash";
import { Browser } from "puppeteer";
import { initializePuppeteer } from "../config/puppeteer";
import { blockRessources, googleSearchUrl } from "../constants";
import { Group } from "../types";
import { cleanText } from "../utils";

// Initialize puppeteer browser
const browser = await initializePuppeteer();

// Search on Google using query string - takes query array as parameter
export const searchOnGoogle = async (query: string[]) => {
  try {
    const items = await Promise.all([
      ...query.map((keyword) => searchItem(keyword, browser, true)),
      ...query.map((keyword) => searchItem(keyword, browser, false)),
    ]);

    // grouping by keyword name
    const grouped = _.groupBy(items, "name");
    // merging all items in one object
    const merged = _.map(grouped, (group: Group) => _.merge(...group));

    return _.values(merged);
  } catch {
    return [];
  }
};

// Search for an item - keyword and browser are passed as parameters
export const searchItem = async (
  keyword: string,
  browser: Browser,
  isUsagesSearch = true
) => {
  // creating page with mobile view
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.setRequestInterception(true);

  // aborting requests if they matches list of blocked ressources
  page.on("request", (request) => {
    if (
      blockRessources.includes(request.resourceType()) ||
      request.url().includes(".jpg") ||
      request.url().includes(".jpeg") ||
      request.url().includes(".png") ||
      request.url().includes(".gif") ||
      request.url().includes(".css")
    ) {
      request.abort();
    } else request.continue();
  });

  // go to google and execute search query
  await page.goto(
    `${googleSearchUrl}&q=tác+dụng+${
      !isUsagesSearch ? "phụ+" : ""
    }của+${keyword.replace(/\s/g, "+")}`
  );

  // get contents of element
  const data = await page.evaluate(
    () =>
      (<HTMLElement>(
        Array.from(document.querySelectorAll("h2")).find((el) =>
          el.textContent?.includes("Đoạn trích nổi bật từ web")
        )?.nextElementSibling?.children[0]?.children[0]?.children[0]
          ?.children[0]
      ))?.innerText
  );

  // Close the browser page to prevent memory leaks
  await page.close();

  return {
    name: keyword,
    [isUsagesSearch ? "usages" : "sideEffects"]: data ? cleanText(data) : null,
  };
};
