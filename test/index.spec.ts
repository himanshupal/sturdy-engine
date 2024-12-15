import app from "@/index";
import request from "supertest";

describe("Server", () => {
  it("Establish connection", async () => {
    const response = await request(app).get("/ping");
    expect(response.text).toBe("pong");
  });

  it("Hosts docs page", async () => {
    const response = await request(app).get("/docs");

    expect(response.header["content-type"]).toContain("text/html");
    expect(response.redirect).toBeTruthy();
  });
});
