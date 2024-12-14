import z from "zod";

export const uploadMediaPayload = z.object({
  title: z.string(),
  description: z.string().optional(),
});
