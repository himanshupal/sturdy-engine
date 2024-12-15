import z from "zod";

export const payloadWithId = {
  id: z.coerce.number().positive(),
};
