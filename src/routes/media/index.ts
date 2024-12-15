import { getSharedMedia, mergeMedia, shareMedia, trimMedia, uploadMedia } from "@/handlers";
import { handleSingleFileUpload } from "@/middlewares";
import { Router } from "express";

const router = Router();

router.post("/upload", handleSingleFileUpload("media"), uploadMedia);
router.post("/merge", mergeMedia);
router.post("/trim", trimMedia);

router.put("/share", shareMedia);
router.get("/:publicId", getSharedMedia);

export default router;
