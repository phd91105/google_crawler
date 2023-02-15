import { ChatGPTAPI } from "chatgpt";

export const api = new ChatGPTAPI({
  apiKey: String(process.env.CHAT_GPT_KEY).trim(),
});
