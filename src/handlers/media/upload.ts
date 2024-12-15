import { getPrismaClient } from "@/database";
import { uploadMediaPayload } from "@/payloads";
import { getRandomString } from "@/utils";
import { TxError, handleError } from "@/utils/error";
import { validateFileReturningMetadata } from "@/utils/media";
import type { Request, Response } from "express";

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const { title, description } = await uploadMediaPayload.parseAsync(req.body);

    if (!req.file) {
      throw new TxError(
        {
          message: "No video file provided",
          description: "Please provide a video file to upload",
        },
        400,
      );
    }

    const { duration } = await validateFileReturningMetadata(req.file);

    const prisma = getPrismaClient();

    const newFile = await prisma.video.create({
      data: {
        title,
        description,
        fileName: req.file.originalname,
        filePath: req.file.path,
        publicId: getRandomString(),
        size: req.file.size,
        duration,
      },
      select: {
        id: true,
        size: true,
        title: true,
        description: true,
        duration: true,
        fileName: true,
      },
    });

    res.status(201).json(newFile);
  } catch (err) {
    handleError("uploadMedia", res, err);
  }
};
