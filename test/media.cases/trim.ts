import { rootDir } from "@/constants";
import app from "@/index";
import { deleteDatabaseEntryAndFile } from "@/utils/database";
import path from "node:path";
import request from "supertest";

const mediaNamespace = "/api/v1/media";
const twoMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_2mb.mp4");

const samplePayload = {
  title: "Sample file for test",
  description: "Automated upload for testing",
};

export const trimTestCases = async () => {
  // Upload a file first
  const response = await request(app)
    .post(`${mediaNamespace}/upload`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
    .attach("media", twoMBSampleFilePath)
    .field(samplePayload);

  expect(response.status).toBe(201);
  expect(response.body.title).toEqual(samplePayload.title);
  expect(response.body.description).toEqual(samplePayload.description);

  {
    // Successfully trim the file uploaded
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
        startAt: "3",
        endAt: "8",
      });

    expect(trimmed.status).toBe(201);
    expect(trimmed.body.duration).toBeCloseTo(5);

    expect(trimmed.body.title).toContain("cut");
    expect(trimmed.body.title).toContain(samplePayload.title);

    await deleteDatabaseEntryAndFile(trimmed.body.id);
  }

  {
    // End time not provided
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
        startAt: "3",
      });

    expect(trimmed.status).toBe(422);
    expect(trimmed.body.message).toEqual("Please check the data provided");
  }

  {
    // Start time not provided
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
        endAt: "2",
      });

    expect(trimmed.status).toBe(422);
    expect(trimmed.body.message).toEqual("Please check the data provided");
  }

  {
    // Start time after end time
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
        startAt: "5",
        endAt: "2",
      });

    expect(trimmed.status).toBe(400);
    expect(trimmed.body.message).toEqual("Invalid timestamp provided");
  }

  {
    // File not found
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: 999,
        startAt: "2",
        endAt: "10",
      });

    expect(trimmed.status).toBe(404);
    expect(trimmed.body.message).toEqual("File not found");
  }

  {
    // End after video end duration
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
        startAt: "10",
        endAt: "55:30",
      });

    expect(trimmed.status).toBe(400);
    expect(trimmed.body.message).toEqual("Invalid end duration");
  }

  {
    // End after video end duration
    const trimmed = await request(app)
      .post(`${mediaNamespace}/trim`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
        startAt: "10",
        endAt: "55:30",
      });

    expect(trimmed.status).toBe(400);
    expect(trimmed.body.message).toEqual("Invalid end duration");
  }

  await deleteDatabaseEntryAndFile(response.body.id);
};
