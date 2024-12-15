import { getPrismaClient } from "@/database";
import fs from "node:fs/promises";

export const deleteDatabaseEntryAndFile = async (id: number) => {
  try {
    const prisma = getPrismaClient();

    const { filePath } = await prisma.video.delete({
      where: { id },
      select: {
        filePath: true,
      },
    });

    await fs.rm(filePath, {
      maxRetries: 3,
    });
  } catch (err) {
    console.error("Failed to delete file with id:", id, err);
  }
};
