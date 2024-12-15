import { isValidVideoTimestamp } from "@/utils/media";
import dayjs from "dayjs";
import z from "zod";

import { payloadWithId } from "./common";

const commonVideoUploadParams = {
  title: z.string(),
  description: z.string().optional(),
};

export const uploadMediaPayload = z.object(commonVideoUploadParams);

export const trimMediaPayload = z
  .object({
    startAt: z.string(),
    endAt: z.string(),
  })
  .extend(payloadWithId)
  .refine(({ startAt }) => isValidVideoTimestamp(startAt), "Start time is not valid")
  .refine(({ endAt }) => isValidVideoTimestamp(endAt), "End time is not valid");

export const mergeMediaPayload = z
  .object({
    videos: z.array(z.number().positive()),
  })
  .extend(commonVideoUploadParams);

export const shareMediaPayload = z
  .object({
    duration: z.coerce.number().positive().optional(),
    expireAt: z.string().datetime().optional(),
  })
  .extend(payloadWithId)
  .refine(({ expireAt }) => !expireAt || dayjs(expireAt).isAfter(), "`expireAt` must be in future")
  .refine(
    ({ duration, expireAt }) => (duration || expireAt) && !(duration && expireAt),
    "Provide either `duration` or `expireAt`",
  );

export const getSharedMediaPayload = z.object({
  publicId: z.string().length(12),
});
