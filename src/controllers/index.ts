import {
  chatGpt,
  searchOnGoogle,
  getWikipediaContent,
  getWikipediaLink,
  correctSpelling,
} from "../clients";
import { Request, Response } from "express";
import _ from "lodash";
import { HttpStatusCode } from "axios";

export const searchGoogle = async (request: Request, response: Response) => {
  try {
    const result = await searchOnGoogle(request.body.q);
    return response.status(HttpStatusCode.Ok).json(result);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "searchGoogle" });
  }
};

export const chat = async (request: Request, response: Response) => {
  try {
    const result = await chatGpt(request.body.message);
    return response.status(HttpStatusCode.Ok).json(result);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "chat" });
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
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "spelling" });
  }
};

export const getWikiData = async (request: Request, response: Response) => {
  try {
    const wikiData = {};

    const correctedWords = await Promise.all(
      request.body.words.map((word: string) => correctSpelling(word))
    );

    const wikipediaLinks = await Promise.all(
      correctedWords.map((word) => getWikipediaLink(word, request.body.lang))
    );

    const wikipediaContents = await Promise.all(
      wikipediaLinks.map((link) => getWikipediaContent(link))
    );

    correctedWords.forEach((word, index) => {
      _.set(wikiData, _.camelCase(word), wikipediaContents[index]);
    });

    return response.status(HttpStatusCode.Ok).json(wikiData);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "getWikiData" });
  }
};
