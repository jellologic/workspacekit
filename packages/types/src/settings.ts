import { z } from "zod";

// --- Provider defaults ---

export const ProviderSettingsSchema = z.object({
  req_cpu: z.string(),
  req_mem: z.string(),
  lim_cpu: z.string(),
  lim_mem: z.string(),
});
export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;

// --- LimitRange ---

export const LimitRangeSchema = z.object({
  max_cpu: z.string(),
  max_mem: z.string(),
  def_cpu: z.string(),
  def_mem: z.string(),
  def_req_cpu: z.string(),
  def_req_mem: z.string(),
});
export type LimitRange = z.infer<typeof LimitRangeSchema>;

// --- Quota ---

export const QuotaSchema = z.object({
  req_cpu: z.string(),
  req_mem: z.string(),
  pods: z.string(),
  used_req_cpu: z.string(),
  used_req_mem: z.string(),
  used_pods: z.string(),
});
export type Quota = z.infer<typeof QuotaSchema>;

// --- Settings (combined response) ---

export const SettingsSchema = z.object({
  provider: ProviderSettingsSchema.optional().default({
    req_cpu: "",
    req_mem: "",
    lim_cpu: "",
    lim_mem: "",
  }),
  limitrange: LimitRangeSchema.optional().default({
    max_cpu: "",
    max_mem: "",
    def_cpu: "",
    def_mem: "",
    def_req_cpu: "",
    def_req_mem: "",
  }),
  quota: QuotaSchema.optional().default({
    req_cpu: "",
    req_mem: "",
    pods: "",
    used_req_cpu: "",
    used_req_mem: "",
    used_pods: "",
  }),
});
export type Settings = z.infer<typeof SettingsSchema>;

// --- Workspace defaults ---

export const WorkspaceDefaultsSchema = z.object({
  req_cpu: z.string(),
  req_mem: z.string(),
  lim_cpu: z.string(),
  lim_mem: z.string(),
});
export type WorkspaceDefaults = z.infer<typeof WorkspaceDefaultsSchema>;

// --- Save settings input schemas ---

export const SaveLimitRangeInputSchema = z.object({
  max_cpu: z.string(),
  max_mem: z.string(),
  def_cpu: z.string(),
  def_mem: z.string(),
  def_req_cpu: z.string(),
  def_req_mem: z.string(),
});
export type SaveLimitRangeInput = z.infer<typeof SaveLimitRangeInputSchema>;

export const SaveQuotaInputSchema = z.object({
  req_cpu: z.string(),
  req_mem: z.string(),
  pods: z.string(),
});
export type SaveQuotaInput = z.infer<typeof SaveQuotaInputSchema>;

export const SaveDefaultsInputSchema = z.object({
  req_cpu: z.string(),
  req_mem: z.string(),
  lim_cpu: z.string(),
  lim_mem: z.string(),
});
export type SaveDefaultsInput = z.infer<typeof SaveDefaultsInputSchema>;
