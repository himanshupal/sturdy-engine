import { mergeMedia, shareMedia, trimMedia, uploadMedia } from "@/handlers";
import { handleMediaUpload } from "@/middlewares";
import { Router } from "express";

const router = Router();

router.post("/upload", handleMediaUpload("media"), uploadMedia);
router.post("/merge", mergeMedia);
router.post("/trim", trimMedia);

router.get("/share/:id", shareMedia);

export default router;