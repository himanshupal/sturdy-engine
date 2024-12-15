import { rootDir } from "@/constants";
import app from "@/index";
import path from "node:path";
import request from "supertest";

const mediaNamespace = "/api/v1/media";
const oneMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_1mb.mp4");

const samplePayload = {
  title: "Sample file for test",
  description: "Automated upload for testing",
};

export const uploadTestCases = async () => {
  {
    // Unauthorized request
    const response = await request(app)
      .post(`${mediaNamespace}/upload`)
      .attach("media", oneMBSampleFilePath)
      .field(samplePayload);

    expect(response.status).toBe(401);
  }

  {
    // Successful file upload
    const response = await request(app)
      .post(`${mediaNamespace}/upload`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .attach("media", oneMBSampleFilePath)
      .field(samplePayload);

    expect(response.status).toBe(201);
    expect(response.body.title).toEqual(samplePayload.title);
    expect(response.body.description).toEqual(samplePayload.description);
  }

  {
    // User doesn't attach a file
    const response = await request(app)
      .post(`${mediaNamespace}/upload`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send(samplePayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("No video file provided");
  }

  {
    // User doesn't provide a title
    const response = await request(app)
      .post(`${mediaNamespace}/upload`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .attach("media", oneMBSampleFilePath);

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual("Please check the data provided");
  }
};
