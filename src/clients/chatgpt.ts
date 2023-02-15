import { api } from "../config/index.js";

export const chat = async (message: string) => {
  const data = await api.sendMessage(message);

  return data;
};
