import "dotenv/config";

export const PORT = process.env.PORT || 8080;
export const origin = process.env.ORIGIN || true;

export const ggConfig = {
  auth: process.env.GG_API_KEY,
  cx: process.env.GG_CX,
  start: 0,
  num: 1,
};

export { openai } from "./openai";
export { instance as axios } from "./axios";
