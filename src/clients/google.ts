import { customsearch } from "@googleapis/customsearch";
import { AxiosResponse } from "axios";
import { axios, googleConfig } from "../config";
import { cleanText } from "../utils";

export const searchOnGoogle = async (query: string, config = googleConfig) => {
  const customSearch = customsearch("v1");
  if (!query) {
    return [];
  }

  try {
    const response = await customSearch.cse.siterestrict.list({
      ...config,
      q: query,
    });

    return response.data.items || [];
  } catch {
    return [];
  }
};

export const correctSpelling = async (text: string): Promise<string> => {
  const getCorrectedText = (response: AxiosResponse) => {
    const data = JSON.parse(response.data.split("\n").pop());
    const correctedText = data.pop().o;
    return cleanText(correctedText);
  };

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
  } catch {
    return text;
  }
};
