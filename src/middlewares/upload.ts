import { fileUploadDir } from "@/constants";
import { getRandomId } from "@/utils";
import multer, { diskStorage } from "multer";
import fs from "node:fs";
import path from "node:path";

/**
 * Middleware to accept file via POST requests
 * @param fieldName Name of the field which will have the file
 */
export const handleMediaUpload = (fieldName: string) => {
  return multer({
    storage: diskStorage({
      destination(_req, _file, callback) {
        if (!fs.existsSync(fileUploadDir)) fs.mkdirSync(fileUploadDir, { recursive: true });
        callback(null, fileUploadDir);
      },
      filename(_req, { originalname }, callback) {
        callback(null, `${getRandomId(32)}${path.extname(originalname)}`);
      },
    }),
    fileFilter(_req, file, callback) {
      const fileTypesRegex = /(.mp4|.avi|.mkv|.mov)$/i;
      return callback(null, fileTypesRegex.test(file.mimetype));
    },
  }).single(fieldName);
};
