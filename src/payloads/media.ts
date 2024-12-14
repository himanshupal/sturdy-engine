import z from "zod";

const commonVideoUploadParams = {
  title: z.string(),
  description: z.string().optional(),
};

export const uploadMediaPayload = z.object(commonVideoUploadParams);

export const trimMediaPayload = z.object({
  id: z.number().positive(),
  startAt: z.number().gte(0),
  endAt: z.number().positive(),
});

export const mergeMediaPayload = z
  .object({
    videos: z.array(z.number().positive()),
  })
  .extend(commonVideoUploadParams);

export const shareMediaPayload = z.object({
  id: z.coerce.number(),
  duration: z.number(),
});

export const getSharedMediaPayload = z.object({
  publicId: z.string(),
});
