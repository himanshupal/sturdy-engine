import z from "zod";

export const uploadMediaPayload = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export const trimMediaPayload = z.object({
  id: z.number().positive(),
  startAt: z.number().gte(0),
  endAt: z.number().positive(),
});
