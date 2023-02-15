import { Router } from "express";
import { chat, getWikiData, searchGoogle } from "../controllers";

const apiRouter = Router();

apiRouter.post("/search", searchGoogle);
apiRouter.post("/chat", chat);
apiRouter.post("/wiki", getWikiData);

export default apiRouter;
