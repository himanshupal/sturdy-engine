import { rootDir } from "@/constants";
import app from "@/index";
import { deleteDatabaseEntryAndFile } from "@/utils/database";
import path from "node:path";
import request from "supertest";

const mediaNamespace = "/api/v1/media";
const oneMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_1mb.mp4");
const twoMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_2mb.mp4");

const samplePayload = {
  title: "Sample file for test",
  description: "Automated upload for testing",
};

export const mergeTestCases = async () => {
  const files: number[] = [];

  {
    // Upload first file to merge
    const response = await request(app)
      .post(`${mediaNamespace}/upload`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .attach("media", oneMBSampleFilePath)
      .field(samplePayload);

    expect(response.status).toBe(201);
    expect(response.body.title).toEqual(samplePayload.title);
    expect(response.body.description).toEqual(samplePayload.description);

    files.push(response.body.id);
  }

  {
    // Try merging with a single file
    const response = await request(app)
      .post(`${mediaNamespace}/merge`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ...samplePayload, videos: files });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Insufficient data");
  }

  {
    // Try merging with a random id
    const response = await request(app)
      .post(`${mediaNamespace}/merge`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ...samplePayload, videos: [...files, 999] });

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("Video not found");
  }

  {
    // Upload second file to merge
    const response = await request(app)
      .post(`${mediaNamespace}/upload`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .attach("media", twoMBSampleFilePath)
      .field(samplePayload);

    expect(response.status).toBe(201);
    expect(response.body.title).toEqual(samplePayload.title);
    expect(response.body.description).toEqual(samplePayload.description);

    files.push(response.body.id);
  }

  {
    // Success merging case
    const response = await request(app)
      .post(`${mediaNamespace}/merge`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ...samplePayload, videos: files });

    expect(response.status).toBe(201);
    expect(response.body.fileName).toContain("Merge");
    expect(response.body.title).toEqual(samplePayload.title);

    await deleteDatabaseEntryAndFile(response.body.id);
    await Promise.all(files.map((id) => deleteDatabaseEntryAndFile(id)));
  }
};
