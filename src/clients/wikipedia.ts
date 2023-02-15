import { axios } from "../config";
import { load } from "cheerio";
import { searchOnGoogle } from "./index";
import { makePattern } from "../utils";
import { keywords } from "../constants";

export const getWikipediaLink = async (text: string, lang = "vi") => {
  if (!text) {
    return null;
  }

  try {
    const response = await axios.get("/w/rest.php/v1/search/page", {
      baseURL: `https://${lang}.wikipedia.org`,
      params: {
        q: text,
        limit: 1,
      },
    });

    const pages = response.data.pages || [];
    const link =
      pages.length > 0
        ? `https://${lang}.wikipedia.org/wiki/${pages[0].key}`
        : null;

    if (!link) {
      const googleResults = await searchOnGoogle(text);
      const firstResult = googleResults[0] || {};
      return firstResult.link || null;
    }

    return link;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getWikipediaContent = async (link: string | null) => {
  if (!link) {
    return null;
  }

  try {
    const response = await axios.get(link);
    const $ = load(response.data);
    const matches: string[] = [];
    let text = "";

    const paragraphs = $(
      "#bodyContent > #mw-content-text > .mw-parser-output > p"
    );
    const numParagraphs = paragraphs.length;

    for (let i = 0; i < numParagraphs; i++) {
      text += $(paragraphs[i]).text() + ". ";
    }

    const pattern = makePattern(keywords);

    text.split(".").forEach((item) => {
      if (pattern.test(item)) {
        matches.push(item.trim());
      }
    });

    return { matches, text };
  } catch (error) {
    console.error(error);
    return null;
  }
};
