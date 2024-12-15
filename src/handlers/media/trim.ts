import { getPrismaClient } from "@/database";
import { trimMediaPayload } from "@/payloads";
import { getRandomString } from "@/utils";
import { TxError, handleError } from "@/utils/error";
import { getTimestampInSeconds, getVideoMetadata, trimVideo } from "@/utils/media";
import type { Request, Response } from "express";

export const trimMedia = async (req: Request, res: Response) => {
  try {
    const { id, startAt, endAt } = await trimMediaPayload.parseAsync(req.body);

    const startAtDuration = getTimestampInSeconds(startAt);
    const endAtDuration = getTimestampInSeconds(endAt);

    if (startAtDuration > endAtDuration) {
      throw new TxError(
        {
          message: "Invalid timestamp provided",
          description: "End time must be after start time",
        },
        400,
      );
    }

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

    if (file.duration < endAtDuration) {
      throw new TxError(
        {
          message: "Invalid end duration",
          description: "Given video end timestamp is more than video duration",
        },
        400,
      );
    }

    const trimDuration = endAtDuration - startAtDuration;

    if (trimDuration === file.duration) {
      throw new TxError("No trimming required", 202);
    }

    const newFilePath = await trimVideo(file.filePath, startAtDuration, trimDuration);
    const { size, duration } = await getVideoMetadata(newFilePath);

    const newFile = await prisma.video.create({
      data: {
        title: `cut_${getRandomString(3)}_${file.title}`,
        fileName: file.fileName,
        publicId: getRandomString(),
        filePath: newFilePath,
        duration,
        size,
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
    handleError("trimMedia", res, err);
  }
};
