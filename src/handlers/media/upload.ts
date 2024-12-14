import { mediaDurationLimitInSeconds, mediaSizeLimitInBytes } from "@/constants";
import { getPrismaClient } from "@/database";
import { uploadMediaPayload } from "@/payloads";
import { getRandomId } from "@/utils";
import { TxError, handleError } from "@/utils/error";
import { getVideoDuration } from "@/utils/media";
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

    if (req.file.size < mediaSizeLimitInBytes.min) {
      throw new TxError(
        {
          message: "Provided file is too small",
          description: `File size must be between ${mediaSizeLimitInBytes.min / 1000 / 1000} and ${mediaSizeLimitInBytes.max / 1000 / 1000} MB`,
        },
        400,
      );
    }

    if (req.file.size > mediaSizeLimitInBytes.max) {
      throw new TxError(
        {
          message: "Provided file is too large",
          description: `File size must be between ${mediaSizeLimitInBytes.min / 1000 / 1000} and ${mediaSizeLimitInBytes.max / 1000 / 1000} MB`,
        },
        400,
      );
    }

    const duration = await getVideoDuration(req.file.path);

    if (duration < mediaDurationLimitInSeconds.min) {
      throw new TxError(
        {
          message: "Video is too short",
          description: `Video duration must be between ${mediaDurationLimitInSeconds.min} and ${mediaDurationLimitInSeconds.max} seconds`,
        },
        400,
      );
    }

    if (duration > mediaDurationLimitInSeconds.max) {
      throw new TxError(
        {
          message: "Video is too long",
          description: `Video duration must be between ${mediaDurationLimitInSeconds.min} and ${mediaDurationLimitInSeconds.max} seconds`,
        },
        400,
      );
    }

    const prisma = getPrismaClient();

    const { id } = await prisma.video.create({
      data: {
        title,
        description,
        fileName: req.file.originalname,
        filePath: req.file.path,
        publicId: getRandomId(),
        size: req.file.size,
        duration,
      },
      select: {
        id: true,
      },
    });

    res.status(201).json(id);
  } catch (err) {
    handleError("uploadMedia", res, err);
  }
};
