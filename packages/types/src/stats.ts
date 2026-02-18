import { z } from "zod";

// --- Memory info ---

export const MemInfoSchema = z.object({
  total: z.number(),
  used: z.number(),
  buffers: z.number(),
  cached: z.number(),
  available: z.number(),
});
export type MemInfo = z.infer<typeof MemInfoSchema>;

// --- Swap info ---

export const SwapInfoSchema = z.object({
  total: z.number(),
  used: z.number(),
});
export type SwapInfo = z.infer<typeof SwapInfoSchema>;

// --- Disk info ---

export const DiskInfoSchema = z.object({
  total: z.number(),
  used: z.number(),
  available: z.number(),
});
export type DiskInfo = z.infer<typeof DiskInfoSchema>;

// --- Process info ---

export const ProcessInfoSchema = z.object({
  pid: z.string(),
  user: z.string(),
  cpu: z.string(),
  mem: z.string(),
  rss: z.number(),
  cmd: z.string(),
});
export type ProcessInfo = z.infer<typeof ProcessInfoSchema>;

// --- System stats ---

export const SystemStatsSchema = z.object({
  cpu: z.record(z.string(), z.number()),
  ncpu: z.number(),
  mem: MemInfoSchema,
  swap: SwapInfoSchema,
  load: z.tuple([z.number(), z.number(), z.number()]),
  tasks: z.string(),
  uptime: z.string(),
  disk: DiskInfoSchema,
  procs: z.array(ProcessInfoSchema),
});
export type SystemStats = z.infer<typeof SystemStatsSchema>;

// --- Usage history entry ---

export const UsageEntrySchema = z.object({
  timestamp: z.number(),
  cpu_mc: z.number(),
  mem_bytes: z.number(),
});
export type UsageEntry = z.infer<typeof UsageEntrySchema>;
