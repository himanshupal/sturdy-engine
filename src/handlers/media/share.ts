import { getPrismaClient } from "@/database";
import { getShareMediaQueryPayload, getSharedMediaPayload, shareMediaPayload } from "@/payloads";
import { TxError, handleError } from "@/utils/error";
import dayjs from "dayjs";
import type { Request, Response } from "express";
import fs from "node:fs";

export const shareMedia = async (req: Request, res: Response) => {
  try {
    const { id, duration, expireAt } = await shareMediaPayload.parseAsync(req.body);

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

    const shareDuration = duration || dayjs(expireAt).diff(dayjs(), "seconds");

    const { publicId } = await prisma.video.update({
      where: { id },
      data: {
        isShared: true,
        sharedFor: shareDuration,
        sharedAt: new Date(),
      },
      select: {
        publicId: true,
      },
    });

    res.json({
      url: `/api/v1/media/${publicId}`,
      expireAt: expireAt || dayjs().add(shareDuration, "seconds").toJSON(),
    });
  } catch (err) {
    handleError("shareMedia", res, err);
  }
};

export const getSharedMedia = async (req: Request, res: Response) => {
  try {
    const { publicId } = await getSharedMediaPayload.parseAsync(req.params);
    const { download } = await getShareMediaQueryPayload.parseAsync(req.query);

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
        404,
      );
    }

    if (!file.isShared) {
      throw new TxError("File is not being shared", 403);
    }

    if (dayjs(file.sharedAt!).add(file.sharedFor!, "seconds").isBefore()) {
      await prisma.video.update({
        select: { id: true },
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

    res.setHeader("Content-Disposition", download ? "attachment" : "inline");
    res.setHeader("Content-Type", "video/webm");
    res.setHeader("Content-Length", file.size);
    fs.createReadStream(file.filePath)
      .pipe(res)
      .on("error", (err) => {
        console.error("getShareMedia: reading file while sharing:", err);
        throw new TxError("Failed to read file", 500);
      });
  } catch (err) {
    handleError("shareMedia", res, err);
  }
};
