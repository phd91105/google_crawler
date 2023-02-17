import { searchOnGoogle } from "../clients";
import { Request, Response } from "express";

export const searchGoogle = async (request: Request, response: Response) => {
  try {
    const result = await searchOnGoogle(request.body.keywords);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json({ error });
  }
};
