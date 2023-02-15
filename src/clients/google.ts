import { customsearch } from "@googleapis/customsearch";
import { AxiosResponse } from "axios";
import { axios, ggConfig } from "../config";

export const searchOnGoogle = async (query: string) => {
  const customSearch = customsearch("v1");
  let results;

  if (query) {
    const response = await customSearch.cse.siterestrict.list({
      ...ggConfig,
      q: query,
    });
    results = response.data.items || [];
  }

  return results || [];
};

export const correctSpelling = async (text: string): Promise<string> => {
  try {
    const response = await axios.get("/complete/search", {
      baseURL: "https://www.google.com",
      params: {
        q: text,
        client: "gws-wiz",
        xssi: "t",
        hl: "vi",
      },
    });

    const correctedText = getCorrectedText(response);

    return correctedText;
  } catch (error) {
    return text;
  }
};

const cleanText = (text: string) => {
  return text.replace(/<[/]?\w+>/g, "").trim();
};

const getCorrectedText = (response: AxiosResponse) => {
  const data = JSON.parse(response.data.split("\n").pop());
  const correctedText = data.pop().o;
  return cleanText(correctedText);
};
