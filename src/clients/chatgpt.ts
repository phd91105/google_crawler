import { api } from "../config";

export const chat = async (message: string) => {
  const data = await api.sendMessage(message);

  return data;
};
