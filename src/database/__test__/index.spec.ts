import { getPrismaClient } from "..";

describe("Database", () => {
  it("Connects", async () => {
    const prisma = getPrismaClient();

    expect(prisma).toBeDefined();
    expect(await prisma.video.count()).toBeDefined();
  });
});
