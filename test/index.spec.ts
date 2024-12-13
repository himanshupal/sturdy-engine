import request from "supertest";

import app from "../src";

it("Server pings", async () => {
  const response = await request(app).get("/ping");
  expect(response.text).toBe("pong");
});
