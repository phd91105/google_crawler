import express from "express";
import cors from "cors";
import { origin } from "./config";
import router from "./routes";

const app = express();

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(
    cors({
      origin,
    })
  )
  .use(router);

export default app;
