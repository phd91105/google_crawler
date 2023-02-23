import { Request, Response } from 'express';

import { searchOnGoogle } from '../clients';
import { searchOnGoogleV2 } from '../clients/google-v2';
import { Error } from '../types';

export const searchGoogle = async (request: Request, response: Response) => {
  try {
    const { keywords, lang } = request.body;

    const result = await searchOnGoogle(keywords, lang);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json({ error: (<Error>error).message });
  }
};

export const searchGoogleV2 = async (request: Request, response: Response) => {
  try {
    const { keywords, lang } = request.body;

    const result = await searchOnGoogleV2(keywords, lang);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json({ error: (<Error>error).message });
  }
};
