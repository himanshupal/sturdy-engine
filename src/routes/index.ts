import { Router } from "express";

import mediaRouter from "./media";

const router = Router();

router.use("/media", mediaRouter);

export default router;
