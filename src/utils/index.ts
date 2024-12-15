import { fileUploadDir } from "@/constants";
import { init } from "@paralleldrive/cuid2";
import path from "node:path";

export const getRandomString = (length = 12) => init({ length })();

export const dataIsString = (data: unknown): data is string => typeof data === "string";

export const getRandomFileNameWithExtension = (sampleFile: string) => {
  return `${getRandomString(32)}${path.extname(sampleFile)}`;
};

export const getRandomFilePath = (sampleFile: string) => {
  return path.join(fileUploadDir, getRandomFileNameWithExtension(sampleFile));
};

export const sleep = (seconds: number, reject?: true): Promise<void> => {
  return new Promise((res, rej) => setTimeout(reject ? rej : res, seconds * 1000));
};
