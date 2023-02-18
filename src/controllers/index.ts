import { Request, Response } from 'express';

import { searchOnGoogle } from '../clients';

export const searchGoogle = async (request: Request, response: Response) => {
  try {
    const result = await searchOnGoogle(request.body.keywords);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json({ error });
  }
};
