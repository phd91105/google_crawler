import { chatGpt, googleSearch } from "../clients/index.js";
import { Request, Response } from "express";
import { spellingCorrection } from "../clients/google.js";
import { loadContent, loadLink } from "../clients/wikipedia.js";
import _ from "lodash";

export const searchGoogle = async (request: Request, response: Response) => {
  try {
    const result = await googleSearch(request.body.q);
    return response.json(result);
  } catch (error) {
    return response.json({ error });
  }
};

export const chat = async (request: Request, response: Response) => {
  try {
    const result = await chatGpt(request.body.message);
    return response.json(result);
  } catch (error) {
    return response.json({ error });
  }
};

export const spelling = async (request: Request, response: Response) => {
  try {
    const promises = [];
    for (const word of request.body.words) {
      promises.push(spellingCorrection(word));
    }
    const result = await Promise.all(promises);
    return response.json(result);
  } catch (error) {
    return response.json({ error });
  }
};

export const getWiki = async (request: Request, response: Response) => {
  try {
    const result = {};

    const textArray = await Promise.all(
      request.body.words.map((word: string) => spellingCorrection(word))
    );
    const linkWiki = await Promise.all(textArray.map((text) => loadLink(text)));

    const content = await Promise.all(
      textArray.map((_, index) => loadContent(linkWiki[index]))
    );

    textArray.forEach((text, index) => {
      _.set(result, _.camelCase(text), content[index]);
    });

    return response.json(result);
  } catch (error) {
    return response.json({ error });
  }
};
