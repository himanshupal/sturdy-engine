import { getPrismaClient } from "@/database";
import { trimMediaPayload } from "@/payloads";
import { getRandomId } from "@/utils";
import { TxError, handleError } from "@/utils/error";
import { getVideoSize, trimVideo } from "@/utils/media";
import type { Request, Response } from "express";

export const trimMedia = async (req: Request, res: Response) => {
  try {
    const { id, startAt, endAt } = await trimMediaPayload.parseAsync(req.body);

    const prisma = getPrismaClient();

    const file = await prisma.video.findUnique({
      where: { id },
      select: {
        title: true,
        fileName: true,
        filePath: true,
        duration: true,
      },
    });

    if (!file) {
      throw new TxError(
        {
          message: "File not found",
          description: `No file exists with given id: ${id}`,
        },
        404,
      );
    }

    if (file.duration < endAt) {
      throw new TxError(
        {
          message: "Invalid end duration",
          description: "Given video end timestamp is more than video duration",
        },
        400,
      );
    }

    const duration = endAt - startAt;

    if (duration === file.duration) {
      throw new TxError("No trimming required", 202);
    }

    const newFilePath = await trimVideo(file.filePath, startAt, duration);
    const size = await getVideoSize(newFilePath);

    const { id: newId } = await prisma.video.create({
      data: {
        title: `cut_${getRandomId(3)}_${file.title}`,
        fileName: file.fileName,
        publicId: getRandomId(),
        filePath: newFilePath,
        duration,
        size,
      },
      select: {
        id: true,
      },
    });

    res.status(201).json(newId);
  } catch (err) {
    handleError("trimMedia", res, err);
  }
};
