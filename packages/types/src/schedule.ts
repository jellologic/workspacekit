import { z } from "zod";

// --- Schedule ---

export const ScheduleSchema = z.object({
  workspace: z.string(),
  pod_name: z.string(),
  action: z.enum(["start", "stop"]),
  days: z.array(z.string()),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});
export type Schedule = z.infer<typeof ScheduleSchema>;

// --- Schedule input schemas ---

export const SetScheduleInputSchema = z.object({
  workspace: z.string(),
  pod_name: z.string(),
  action: z.enum(["start", "stop"]),
  days: z.array(z.string()),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});
export type SetScheduleInput = z.infer<typeof SetScheduleInputSchema>;

export const RemoveScheduleInputSchema = z.object({
  workspace: z.string(),
  action: z.enum(["start", "stop"]),
});
export type RemoveScheduleInput = z.infer<typeof RemoveScheduleInputSchema>;

// --- Expiry ---

export const ExpirySchema = z.object({
  days: z.number().int().min(0),
});
export type Expiry = z.infer<typeof ExpirySchema>;

export const SetExpiryInputSchema = z.object({
  days: z.number().int().min(0),
});
export type SetExpiryInput = z.infer<typeof SetExpiryInputSchema>;
