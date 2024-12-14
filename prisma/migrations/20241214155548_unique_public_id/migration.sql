/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `videos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "videos_publicId_key" ON "videos"("publicId");
