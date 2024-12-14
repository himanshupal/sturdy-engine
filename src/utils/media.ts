import { fileUploadDir } from "@/constants";
import ffmpeg, { type FfprobeFormat } from "fluent-ffmpeg";
import fs from "node:fs/promises";
import path from "node:path";

import { getRandomId } from ".";

export const getVideoMetadata = (filePath: string): Promise<FfprobeFormat> => {
  return new Promise((res, rej) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return rej(err);
      res(data.format);
    });
  });
};

/**
 * Get filesize of the video at the filepath provided
 * @param Exact file path
 * @returns Size in bytes
 */
export const getVideoSize = async (filePath: string): Promise<number> => {
  const { size } = await getVideoMetadata(filePath);
  if (!size) throw new Error("Failed to get video size ");
  return size;
};

/**
 * Get duration of the video at the filepath provided
 * @param Exact file path
 * @returns Duration in seconds
 */
export const getVideoDuration = async (filePath: string): Promise<number> => {
  const { duration } = await getVideoMetadata(filePath);
  if (!duration) throw new Error("Failed to read video duration ");
  return duration;
};

export const trimVideo = async (filePath: string, from: number, duration: number): Promise<string> => {
  const newFilePath = `${fileUploadDir}/${getRandomId(32)}${path.extname(filePath)}`;
  return new Promise((res, rej) => {
    ffmpeg(filePath)
      .setStartTime(from)
      .duration(duration)
      .on("end", () => res(newFilePath))
      .on("error", (err) => rej(err))
      .save(newFilePath);
  });
};

export const mergeVideos = async (files: Array<string>): Promise<string> => {
  const newFilePath = `${fileUploadDir}/${getRandomId(32)}${path.extname(files.at(0)!)}`;

  const inputList = path.join(path.dirname(newFilePath), "__tmp");
  await fs.writeFile(inputList, files.map((filePath) => `file '${filePath}'`).join("\n"));

  return new Promise((resolve, reject) => {
    ffmpeg(inputList)
      .inputOption("-safe", "0")
      .inputOption("-f", "concat")
      .outputOption("-c", "copy")
      .on("end", () => {
        fs.rm(inputList).finally(() => {
          resolve(newFilePath);
        });
      })
      .on("error", (error) => {
        fs.rm(inputList).finally(() => {
          reject(error);
        });
      })
      .save(newFilePath);
  });
};
