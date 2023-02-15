import { ChatGPTAPI } from "chatgpt";

export const openai = new ChatGPTAPI({
  apiKey: String(process.env.CHAT_GPT_KEY).trim(),
});
