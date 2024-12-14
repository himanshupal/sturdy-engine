import { PrismaClient } from "@prisma/client";

let client: PrismaClient;

export const getPrismaClient = () => {
  if (!client) client = new PrismaClient();
  return client;
};
