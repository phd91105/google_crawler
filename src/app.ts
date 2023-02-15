import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";
import { origin } from "./config/index.js";

const app = express();

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(
    cors({
      origin,
    })
  )
  .use("/api", apiRouter);

export default app;
