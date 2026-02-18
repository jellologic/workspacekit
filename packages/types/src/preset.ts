import { z } from "zod";

// --- Preset ---

export const PresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  repo_url: z.string(),
  req_cpu: z.string(),
  req_mem: z.string(),
  lim_cpu: z.string(),
  lim_mem: z.string(),
});
export type Preset = z.infer<typeof PresetSchema>;

// --- Preset input schemas ---

export const SavePresetInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  repo_url: z.string(),
  req_cpu: z.string(),
  req_mem: z.string(),
  lim_cpu: z.string(),
  lim_mem: z.string(),
});
export type SavePresetInput = z.infer<typeof SavePresetInputSchema>;

export const DeletePresetInputSchema = z.object({
  id: z.string(),
});
export type DeletePresetInput = z.infer<typeof DeletePresetInputSchema>;

export const CreateFromPresetInputSchema = z.object({
  preset_id: z.string(),
  name: z.string().optional(),
});
export type CreateFromPresetInput = z.infer<typeof CreateFromPresetInputSchema>;
