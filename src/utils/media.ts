import ffmpeg, { type FfprobeFormat } from "fluent-ffmpeg";

const getVideoMetadata = (filePath: string): Promise<FfprobeFormat> => {
  return new Promise((res, rej) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return rej(err);
      res(data.format);
    });
  });
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
