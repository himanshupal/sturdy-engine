import app from "@/index";
import request from "supertest";

it("Server pings", async () => {
  const response = await request(app).get("/ping");
  expect(response.text).toBe("pong");
});
