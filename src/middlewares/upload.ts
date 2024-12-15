import { fileUploadDir } from "@/constants";
import { getRandomFileNameWithExtension } from "@/utils";
import multer, { diskStorage } from "multer";
import fs from "node:fs";

/**
 * Middleware to accept file via POST requests
 * @param fieldName Name of the field which will have the file
 */
export const handleSingleFileUpload = (fieldName: string) => {
  return multer({
    storage: diskStorage({
      destination(_req, _file, callback) {
        if (!fs.existsSync(fileUploadDir)) fs.mkdirSync(fileUploadDir, { recursive: true });
        callback(null, fileUploadDir);
      },
      filename(_req, { originalname }, callback) {
        callback(null, getRandomFileNameWithExtension(originalname));
      },
    }),
    fileFilter(_req, file, callback) {
      const fileTypesRegex = /(.mp4|.avi|.mkv|.mov)$/i;
      return callback(null, fileTypesRegex.test(file.mimetype));
    },
  }).single(fieldName);
};
