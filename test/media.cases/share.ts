import { rootDir } from "@/constants";
import app from "@/index";
import { sleep } from "@/utils";
import { deleteDatabaseEntryAndFile } from "@/utils/database";
import dayjs from "dayjs";
import path from "node:path";
import request from "supertest";

const mediaNamespace = "/api/v1/media";
const twoMBSampleFilePath = path.join(rootDir, "samples", "SampleVideo_1280x720_2mb.mp4");

const samplePayload = {
  title: "Sample file for test",
  description: "Automated upload for testing",
};

const shareAndVerify = async (payload: { id: string } & ({ duration: number } | { expireAt: string })) => {
  const shared = await request(app)
    .put(`${mediaNamespace}/share`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
    .send(payload);

  expect(shared.status).toBe(200);
  expect(shared.body.expireAt).toBeDefined();
  expect(shared.body.url).toContain("/api/v1/media/");

  {
    // Access the shared video
    const response = await request(app).get(shared.body.url).set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("video/webm");
    expect(response.headers["content-disposition"]).toContain("inline");
  }

  {
    // Try to download the shared video
    const response = await request(app)
      .get(`${shared.body.url}?download=1`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("video/webm");
    expect(response.headers["content-disposition"]).toContain("attachment");
  }

  await sleep(5.5);

  {
    // Trying to access the shared video after given time has elapsed
    const response = await request(app).get(shared.body.url).set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("File is not being shared anymore");
  }

  {
    // Trying to access the shared video after given time once again w/o reshare
    const response = await request(app).get(shared.body.url).set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("File is not being shared");
  }
};

export const shareTestCases = async () => {
  // Upload first file to share
  const response = await request(app)
    .post(`${mediaNamespace}/upload`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
    .attach("media", twoMBSampleFilePath)
    .field(samplePayload);

  expect(response.status).toBe(201);
  expect(response.body.title).toEqual(samplePayload.title);
  expect(response.body.description).toEqual(samplePayload.description);

  {
    // Share a not existing video
    const shared = await request(app)
      .put(`${mediaNamespace}/share`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: 999,
        duration: 10,
      });

    expect(shared.status).toBe(404);
    expect(shared.body.message).toBe("Not found");
  }

  {
    // Share a video w/o providing duratio or expiration time
    const shared = await request(app)
      .put(`${mediaNamespace}/share`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        id: response.body.id,
      });

    expect(shared.status).toBe(422);
    expect(shared.body.message).toBe("Please check the data provided");
  }

  {
    // Try to access a non existing video
    const shared = await request(app)
      .get(`${mediaNamespace}/randomVideo`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(shared.status).toBe(404);
    expect(shared.body.message).toBe("Not found");
  }

  await shareAndVerify({ id: response.body.id, duration: 5 });
  await shareAndVerify({ id: response.body.id, expireAt: dayjs().add(5, "seconds").toJSON() });

  await deleteDatabaseEntryAndFile(response.body.id);
};
