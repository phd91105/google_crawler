import "dotenv/config";

export const PORT = process.env.PORT || 8080;
export const origin = process.env.ORIGIN || true;

export const googleApiKeys = String(process.env.GG_API_KEY).split("|");

export const googleConfig = {
  currentKeyIndex: 0,
  auth: googleApiKeys[0],
  cx: process.env.GG_CX,
  start: 0,
  num: 1,
};

export { openai } from "./open-ai";
export { instance as axios } from "./axios";
