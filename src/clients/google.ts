import { customsearch } from "@googleapis/customsearch";
import { axios, ggConfig } from "../config/index.js";

export const search = async (query: string) => {
  const customSearch = customsearch("v1");
  let results;

  if (query) {
    const result = await customSearch.cse.siterestrict.list({
      ...ggConfig,
      q: `${query}`,
    });
    results = result;
  }

  return results || [];
};

export const spellingCorrection = async (text: string) => {
  const result = await axios.get("/complete/search", {
    baseURL: "https://www.google.com",
    params: {
      q: `${text}`,
      client: "gws-wiz-serp",
      xssi: "t",
      hl: "vi",
    },
  });
  const textResult = JSON.parse(result.data.split("\n").pop())
    .pop()
    .o.replace(/<[/]?\w+>/g, "")
    .trim();

  return textResult;
};
