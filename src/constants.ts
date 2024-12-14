import path from "node:path";

export const rootDir = path.resolve(__dirname, "..");
export const fileUploadDir = `${rootDir}/public`;

export const mediaSizeLimitInBytes = {
  min: 100 * 1000, // 100 KB
  max: 25 * 1000 * 1000, // 25 MB
};

export const mediaDurationLimitInSeconds = {
  min: 10, // 10 seconds
  max: 5 * 60, // 15 minutes
};
