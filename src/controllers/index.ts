import {
  chatGpt,
  searchOnGoogle,
  getWikipediaContent,
  getWikipediaLink,
  correctSpelling,
} from "../clients";
import omit from "lodash/omit.js";
import startCase from "lodash/startCase.js";
import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { Wiki } from "../types";

export const searchGoogle = async (request: Request, response: Response) => {
  try {
    const result = await searchOnGoogle(request.body.q);
    return response.status(HttpStatusCode.Ok).json(result);
  } catch (error) {
    return response.status(HttpStatusCode.InternalServerError).json({ error });
  }
};

export const chat = async (request: Request, response: Response) => {
  try {
    const result = await chatGpt(request.body.message);
    return response.status(HttpStatusCode.Ok).json(result);
  } catch (error) {
    return response.status(HttpStatusCode.InternalServerError).json({ error });
  }
};

export const spelling = async (request: Request, response: Response) => {
  try {
    const promises = [];
    for (const word of request.body.words) {
      promises.push(correctSpelling(word));
    }
    const result = await Promise.all(promises);
    return response.status(HttpStatusCode.Ok).json(result);
  } catch (error) {
    return response.status(HttpStatusCode.InternalServerError).json({ error });
  }
};

export const getWikiData = async (request: Request, response: Response) => {
  try {
    const { words, lang, withoutText } = request.body;
    const correctedWords = await Promise.all(
      words.map((word: string) => correctSpelling(word))
    );

    const wikipediaLinks = await Promise.all(
      correctedWords.map((word) => getWikipediaLink(word, lang))
    );

    const wikipediaContents = await Promise.all(
      wikipediaLinks.map((link) => getWikipediaContent(link))
    );

    const wikiData: Wiki[] = correctedWords.map((_, i) => {
      const data = {
        name: startCase(correctedWords[i]),
        refs: wikipediaLinks[i],
        ...wikipediaContents[i],
      };

      if (withoutText) return omit(data, ["text"]);
      return data;
    });

    return response.status(HttpStatusCode.Ok).json({ results: wikiData });
  } catch (error) {
    return response.status(HttpStatusCode.InternalServerError).json({ error });
  }
};
