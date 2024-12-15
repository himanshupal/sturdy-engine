import path from "node:path";

export const rootDir = path.resolve(__dirname, "..");
export const fileUploadDir = path.join(rootDir, "public");

export const validSeekTimeStampRegex = /((2[0-3]|[01][0-9]):)?([0-5][0-9]:)?[0-5][0-9](\.\d{1,7})?/m;
export const acceptedVideoTypesRegex = /(.mp4|.avi|.mkv|.mov)$/i;

export const mediaSizeLimitInBytes = {
  min: 100 * 1000, // 100 KB
  max: 25 * 1000 * 1000, // 25 MB
};

export const mediaDurationLimitInSeconds = {
  min: 10, // 10 seconds
  max: 5 * 60, // 15 minutes
};
