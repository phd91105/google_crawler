import { axios } from "../config";
import { load } from "cheerio";
import { searchOnGoogle } from "./index";
import { cleanText, makePattern } from "../utils";
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
  } catch {
    return null;
  }
};

export const getWikipediaContent = async (link: string | null) => {
  const getMatches = (text: string, pattern: RegExp) => {
    const matches: string[] = [];
    const sentences = text.split(".");
    matches.push(cleanText(sentences[0]));
    sentences.slice(1).forEach((sentence) => {
      if (pattern.test(sentence)) {
        matches.push(cleanText(sentence));
      }
    });
    return matches;
  };

  let matches: string[] = [];
  let text = "";

  if (!link) {
    return { matches, text };
  }

  const response = await axios.get(link);
  const $ = load(response.data);

  const paragraphs = $(
    "#bodyContent > #mw-content-text > .mw-parser-output > p"
  );

  paragraphs.each((_, element) => {
    text += $(element).text() + ". ";
  });

  const pattern = makePattern(keywords);
  matches = getMatches(text, pattern);

  return { matches, text };
};
