import { getPrismaClient } from "@/database";
import { mergeMediaPayload } from "@/payloads";
import { getRandomId } from "@/utils";
import { TxError, handleError } from "@/utils/error";
import { getVideoDuration, getVideoSize, mergeVideos } from "@/utils/media";
import type { Request, Response } from "express";
import path from "node:path";

export const mergeMedia = async (req: Request, res: Response) => {
  try {
    const { title, description, videos } = await mergeMediaPayload.parseAsync(req.body);

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

    const duration = await getVideoDuration(newFilePath);
    const size = await getVideoSize(newFilePath);

    const { id } = await prisma.video.create({
      data: {
        title,
        description,
        duration,
        size,
        filePath: newFilePath,
        publicId: getRandomId(),
        fileName: `Merge_${getRandomId(3)}${path.extname(newFilePath)}`,
      },
    });

    res.status(201).json(id);
  } catch (err) {
    handleError("mergeMedia", res, err);
  }
};
