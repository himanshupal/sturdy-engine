import { getPrismaClient } from "@/database";
import { getSharedMediaPayload, shareMediaPayload } from "@/payloads";
import { TxError, handleError } from "@/utils/error";
import dayjs from "dayjs";
import type { Request, Response } from "express";
import fs from "node:fs";

export const shareMedia = async (req: Request, res: Response) => {
  try {
    const { id, duration } = await shareMediaPayload.parseAsync(req.body);

    const prisma = getPrismaClient();

    const found = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!found) {
      throw new TxError(
        {
          message: "Not found",
          description: "Video you are trying to share could not be found",
        },
        404,
      );
    }

    const { publicId } = await prisma.video.update({
      where: { id },
      data: {
        isShared: true,
        sharedFor: duration,
        sharedAt: new Date(),
      },
      select: {
        publicId: true,
      },
    });

    res.send(publicId);
  } catch (err) {
    handleError("shareMedia", res, err);
  }
};

export const getSharedMedia = async (req: Request, res: Response) => {
  try {
    const { publicId } = await getSharedMediaPayload.parseAsync(req.params);

    const prisma = getPrismaClient();

    const file = await prisma.video.findUnique({
      where: { publicId },
      select: {
        id: true,
        size: true,
        isShared: true,
        filePath: true,
        sharedAt: true,
        sharedFor: true,
      },
    });

    if (!file) {
      throw new TxError(
        {
          message: "Not found",
          description: "Video you are trying to share could not be found",
        },
        400,
      );
    }

    if (!file.isShared) {
      throw new TxError("File is not being shared", 403);
    }

    if (dayjs().isAfter(dayjs(file.sharedAt!).add(file.sharedFor!, "seconds"))) {
      await prisma.video.update({
        where: { publicId },
        data: {
          isShared: false,
        },
      });

      throw new TxError(
        {
          message: "File is not being shared anymore",
          description: "Ask the uploader to share the file again",
        },
        403,
      );
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", file.size);
    fs.createReadStream(file.filePath).pipe(res);
  } catch (err) {
    handleError("shareMedia", res, err);
  }
};
