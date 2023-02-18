import 'dotenv/config';

export const port = process.env.PORT || 8080;
export const origin = process.env.ORIGIN || true;

export const browserWSEndpoint =
  process.env.BROWSER_WSE || 'ws://localhost:3000';
