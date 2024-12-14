import { fileUploadDir } from "@/constants";
import { init } from "@paralleldrive/cuid2";
import path from "node:path";

export const getRandomId = (length = 12) => init({ length })();

export const getRandomFilePath = (sampleFileType: string) => {
  return path.join(fileUploadDir, `${getRandomId(32)}${path.extname(sampleFileType)}`);
};
