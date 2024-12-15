import { getPrismaClient } from "@/database";
import { mergeMediaPayload } from "@/payloads";
import { getRandomString } from "@/utils";
import { TxError, handleError } from "@/utils/error";
import { getVideoMetadata, mergeVideos } from "@/utils/media";
import type { Request, Response } from "express";
import path from "node:path";

export const mergeMedia = async (req: Request, res: Response) => {
  try {
    const { title, description, videos } = await mergeMediaPayload.parseAsync(req.body);

    if (videos.length < 2) {
      throw new TxError(
        {
          message: "Insufficient data",
          description: "Merge requires at least 2 videos",
        },
        400,
      );
    }

    const prisma = getPrismaClient();

    const lookupResult = await Promise.all(
      videos.map((id) =>
        prisma.video.findUnique({
          where: { id },
          select: {
            id: true,
            filePath: true,
          },
        }),
      ),
    );

    const notFound = videos.map((id, index) => (!lookupResult[index] ? id : false)).filter((v): v is number => !!v);

    if (notFound.length) {
      throw new TxError(
        {
          message: "Video not found",
          description: `Not able to find video with id: ${notFound.join(", ")}`,
        },
        404,
      );
    }

    const newFilePath = await mergeVideos(lookupResult.map((x) => x!.filePath));
    const { size, duration } = await getVideoMetadata(newFilePath);

    const newFile = await prisma.video.create({
      data: {
        title,
        description,
        duration,
        size,
        filePath: newFilePath,
        publicId: getRandomString(),
        fileName: `Merge_${getRandomString(3)}${path.extname(newFilePath)}`,
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
    handleError("mergeMedia", res, err);
  }
};
