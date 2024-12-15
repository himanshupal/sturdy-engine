import { rootDir } from "@/constants";
import fs from "node:fs/promises";
import path from "node:path";

import { getTimestampInSeconds, getVideoMetadata, isValidVideoTimestamp, mergeVideos, trimVideo } from "../media";

const oneMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_1mb.mp4");
const twoMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_2mb.mp4");

describe("Media Utilities", () => {
  it("Validates video timestamp", () => {
    expect(isValidVideoTimestamp(12)).toBeTruthy();
    expect(isValidVideoTimestamp("12")).toBeTruthy();
    expect(isValidVideoTimestamp("12.123")).toBeTruthy();
    expect(isValidVideoTimestamp("11:12.123")).toBeTruthy();
    expect(isValidVideoTimestamp("13:12")).toBeTruthy();
    expect(isValidVideoTimestamp("60:12")).toBeFalsy();
    expect(isValidVideoTimestamp("24:00:12")).toBeFalsy();
    expect(isValidVideoTimestamp("11:60.123")).toBeFalsy();
    expect(isValidVideoTimestamp("23:00:11")).toBeTruthy();
    expect(isValidVideoTimestamp("23:10:11.12")).toBeTruthy();
  });

  it("Converts given time frame in seconds", () => {
    expect(getTimestampInSeconds(123)).toEqual(123);
    expect(getTimestampInSeconds("12:03")).toEqual(12 * 60 + 3);
    expect(getTimestampInSeconds("12:03.123")).toEqual(12 * 60 + 3.123);
    expect(getTimestampInSeconds("01:13:03")).toEqual(60 * 60 + 13 * 60 + 3);
  });

  it("Reads video metadata correctly", async () => {
    const { size, duration } = await getVideoMetadata(twoMBSampleFilePath);
    expect(duration).toBeCloseTo(13.5);
    expect(size).toBeCloseTo(2107842);
  });

  it("Can trim the video", async () => {
    const newFilePath = await trimVideo(twoMBSampleFilePath, 5, 5);
    const [ogMeta, cpMeta] = await Promise.all([getVideoMetadata(twoMBSampleFilePath), getVideoMetadata(newFilePath)]);

    expect(cpMeta.size).toBeLessThan(ogMeta.size);
    expect(cpMeta.duration).toBeCloseTo(5);
    await fs.rm(newFilePath);
  });

  it("Can merge the videos", async () => {
    const newFilePath = await mergeVideos([oneMBSampleFilePath, twoMBSampleFilePath]);
    const [firstFileMeta, secondFileMeta, newFileMeta] = await Promise.all([
      getVideoMetadata(oneMBSampleFilePath),
      getVideoMetadata(twoMBSampleFilePath),
      getVideoMetadata(newFilePath),
    ]);

    // Size should be less since metadata is lost
    expect(newFileMeta.size).toBeLessThan(firstFileMeta.size + secondFileMeta.size);
    expect(newFileMeta.duration).toBeCloseTo(firstFileMeta.duration + secondFileMeta.duration);
    await fs.rm(newFilePath);
  });
});
