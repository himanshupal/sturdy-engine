import { mediaDurationLimitInSeconds, mediaSizeLimitInBytes, validSeekTimeStampRegex } from "@/constants";
import ffmpeg, { type FfprobeFormat } from "fluent-ffmpeg";
import fs from "node:fs/promises";
import path from "node:path";

import { getRandomFilePath } from ".";
import { TxError } from "./error";

/**
 * Checks whether the provided timestamp for video is valid
 * @param value A numeric value of seconds or duration in "HH:MM:SS.XXX" format
 */
export const isValidVideoTimestamp = (value: string | number): boolean => {
  if (typeof value === "number") return true;
  return !Number.isNaN(+value) || !!validSeekTimeStampRegex.exec(value);
};

export const getTimestampInSeconds = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!Number.isNaN(+value)) return +value;
  return value
    .split(":")
    .toReversed()
    .reduce((p, c, i) => p + Math.pow(60, i) * +c, 0);
};

/**
 * Get metadata for the video at the path provided
 * @param filePath Exact file path
 */
export const getVideoMetadata = async (filePath: string): Promise<Required<FfprobeFormat>> => {
  const metadata = await new Promise<FfprobeFormat>((res, rej) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return rej(err);
      res(data.format);
    });
  });

  if (!Object.values(metadata).length || !["size", "duration"].every((key) => key in metadata)) {
    throw new TxError("Failed to read video metadata", 500);
  }

  return metadata as Required<FfprobeFormat>;
};

/**
 * Trim or shorten a full length video based on params provided
 * @param filePath Exact path of file to cut
 * @param from Timestamp or number of seconds from where the cut will start
 * @param duration Number of seconds to capture in the cut frame
 * @returns Exact path where the newly created file is saved
 */
export const trimVideo = async (filePath: string, from: number, duration: number): Promise<string> => {
  const newFilePath = getRandomFilePath(filePath);
  return new Promise((res, rej) => {
    ffmpeg(filePath)
      .setStartTime(from)
      .duration(duration)
      .on("end", () => res(newFilePath))
      .on("error", (err) => rej(err))
      .save(newFilePath);
  });
};

/**
 * Merge multiple videos into a single one
 * @param files List of exact path of files to be merged
 * @returns Exact path where the newly created file is saved
 */
export const mergeVideos = async (files: Array<string>): Promise<string> => {
  const newFilePath = getRandomFilePath(files.at(0)!);

  try {
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
  } catch (err) {
    console.error("mergeVideos: creating temporary file", err);
    throw new TxError("Failed to merge video", 500);
  }
};

/**
 * Validates the file size & duration
 * @param file File object as received from multer
 * @returns Metadata related to file
 */
export const validateFileReturningMetadata = async (
  file: Express.Multer.File,
): Promise<ReturnType<typeof getVideoMetadata>> => {
  if (file.size < mediaSizeLimitInBytes.min) {
    throw new TxError(
      {
        message: "Provided file is too small",
        description: `File size must be between ${mediaSizeLimitInBytes.min / 1000 / 1000} and ${mediaSizeLimitInBytes.max / 1000 / 1000} MB`,
      },
      400,
    );
  }

  if (file.size > mediaSizeLimitInBytes.max) {
    throw new TxError(
      {
        message: "Provided file is too large",
        description: `File size must be between ${mediaSizeLimitInBytes.min / 1000 / 1000} and ${mediaSizeLimitInBytes.max / 1000 / 1000} MB`,
      },
      400,
    );
  }

  const metadata = await getVideoMetadata(file.path);

  if (metadata.duration < mediaDurationLimitInSeconds.min) {
    throw new TxError(
      {
        message: "Video is too short",
        description: `Video duration must be between ${mediaDurationLimitInSeconds.min} and ${mediaDurationLimitInSeconds.max} seconds`,
      },
      400,
    );
  }

  if (metadata.duration > mediaDurationLimitInSeconds.max) {
    throw new TxError(
      {
        message: "Video is too long",
        description: `Video duration must be between ${mediaDurationLimitInSeconds.min} and ${mediaDurationLimitInSeconds.max} seconds`,
      },
      400,
    );
  }

  return metadata;
};
