-- CreateTable
CREATE TABLE "videos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "size" REAL NOT NULL,
    "duration" REAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "sharedAt" DATETIME,
    "sharedFor" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
