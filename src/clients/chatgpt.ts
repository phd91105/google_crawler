import { openai } from "../config";

export const chat = async (message: string) => {
  const data = await openai.sendMessage(message);

  return data;
};
