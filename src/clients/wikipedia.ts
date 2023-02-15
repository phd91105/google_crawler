import { axios } from "../config/index.js";
import { load } from "cheerio";

export const loadLink = async (text: string) => {
  if (!text) return null;
  const result = await axios.get("/w/rest.php/v1/search/page", {
    baseURL: "https://vi.wikipedia.org",
    params: {
      q: `${text}`,
      limit: 1,
    },
  });
  const link =
    result.data.pages.length > 0
      ? `https://vi.wikipedia.org/wiki/${result.data.pages[0].key}`
      : null;
  return link;
};

export const loadContent = async (link: string | null) => {
  if (!link) return null;
  const result = await axios.get(link);
  const $ = load(result.data);
  let data = "";

  $("#bodyContent > #mw-content-text > .mw-parser-output > p").each(
    (index, el) => {
      data += $(el).text();
    }
  );

  return data;
};
