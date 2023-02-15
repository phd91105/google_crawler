import { Router } from "express";
import { chat, getWiki, searchGoogle } from "../controllers";

const router = Router();

router.post("/search", searchGoogle);
router.post("/chat", chat);
router.post("/getWiki", getWiki);

export default router;
