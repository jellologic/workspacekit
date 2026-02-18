import { z } from "zod";

// --- Resource shapes ---

export const ResourcesSchema = z.object({
  req_cpu: z.string(),
  req_mem: z.string(),
  lim_cpu: z.string(),
  lim_mem: z.string(),
});
export type Resources = z.infer<typeof ResourcesSchema>;

export const UsageSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
});
export type Usage = z.infer<typeof UsageSchema>;

// --- Workspace (list item) ---

export const WorkspaceSchema = z.object({
  name: z.string(),
  status: z.string(),
  port: z.number(),
  pod: z.string(),
  uid: z.string(),
  running: z.boolean(),
  creating: z.boolean(),
  shutdown_at: z.string(),
  shutdown_hours: z.string(),
  resources: ResourcesSchema.optional(),
  repo: z.string(),
  branch: z.string(),
  dirty: z.boolean(),
  last_commit: z.string(),
  usage: UsageSchema.optional(),
  owner: z.string(),
  last_accessed: z.string(),
  expiry_warning: z.string(),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

// --- Workspace detail sub-schemas ---

export const EventSchema = z.object({
  type: z.string(),
  reason: z.string(),
  age: z.string(),
  message: z.string(),
});
export type Event = z.infer<typeof EventSchema>;

export const PvcSchema = z.object({
  name: z.string(),
  capacity: z.string(),
  status: z.string(),
  storage_class: z.string(),
});
export type Pvc = z.infer<typeof PvcSchema>;

export const ContainerSchema = z.object({
  name: z.string(),
  image: z.string(),
  ready: z.boolean(),
  restart_count: z.number(),
  state: z.record(z.unknown()),
  requests: z.record(z.unknown()),
  limits: z.record(z.unknown()),
});
export type Container = z.infer<typeof ContainerSchema>;

export const PvcUsageSchema = z.union([
  z.object({
    total: z.string(),
    used: z.string(),
    available: z.string(),
    percent: z.number(),
    total_raw: z.number(),
    used_raw: z.number(),
  }),
  z.object({}).strict(),
]);
export type PvcUsage = z.infer<typeof PvcUsageSchema>;

// --- Workspace detail ---

export const WorkspaceDetailSchema = z.object({
  name: z.string(),
  status: z.string(),
  pod: z.string().nullable(),
  port: z.number(),
  events: z.array(EventSchema),
  pvcs: z.array(PvcSchema),
  containers: z.array(ContainerSchema),
  usage: UsageSchema.nullable(),
  repo: z.string(),
  running: z.boolean(),
  creating: z.boolean(),
  uid: z.string(),
  pod_ip: z.string(),
  node: z.string(),
  phase: z.string(),
  conditions: z.array(z.unknown()),
  age: z.string(),
  resources: ResourcesSchema,
  branch: z.string(),
  dirty: z.boolean(),
  last_commit: z.string(),
  pvc_usage: PvcUsageSchema,
  owner: z.string(),
  last_accessed: z.string(),
  expiry_warning: z.string(),
});
export type WorkspaceDetail = z.infer<typeof WorkspaceDetailSchema>;

// --- Git info ---

export const GitInfoSchema = z.object({
  repo: z.string(),
  branch: z.string(),
  dirty: z.boolean(),
  last_commit: z.string(),
});
export type GitInfo = z.infer<typeof GitInfoSchema>;

// --- Creation log ---

export const CreationLogSchema = z.object({
  lines: z.array(z.string()),
  status: z.string(),
});
export type CreationLog = z.infer<typeof CreationLogSchema>;

// --- API response ---

export const ApiResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
});
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// --- User ---

export const UserSchema = z.object({
  password: z.string(),
  role: z.string(),
  prefixes: z.array(z.string()),
});
export type User = z.infer<typeof UserSchema>;

// --- Request input schemas ---

/** Matches k8s resource values like 500m, 2, 1.5, 2Gi, 512Mi */
const k8sResourcePattern = /^\d+(\.\d+)?(m|Ki|Mi|Gi|Ti)?$/

const K8sResourceString = z.string().regex(k8sResourcePattern, {
  message: 'Must be a valid k8s resource value (e.g. "500m", "2", "512Mi", "2Gi")',
})

export const CreateWorkspaceInputSchema = z.object({
  repo: z.string().url({ message: 'Must be a valid URL' }),
  name: z.string().max(63, 'Name must be 63 characters or fewer').optional(),
  owner: z.string().max(63).optional(),
  image: z.string().optional(),
  branch: z.string().optional(),
  req_cpu: K8sResourceString.optional(),
  req_mem: K8sResourceString.optional(),
  lim_cpu: K8sResourceString.optional(),
  lim_mem: K8sResourceString.optional(),
});
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceInputSchema>;

export const StopWorkspaceInputSchema = z.object({
  pod: z.string(),
});
export type StopWorkspaceInput = z.infer<typeof StopWorkspaceInputSchema>;

export const StartWorkspaceInputSchema = z.object({
  pod: z.string(),
});
export type StartWorkspaceInput = z.infer<typeof StartWorkspaceInputSchema>;

export const DeleteWorkspaceInputSchema = z.object({
  name: z.string(),
  pod: z.string(),
  uid: z.string(),
});
export type DeleteWorkspaceInput = z.infer<typeof DeleteWorkspaceInputSchema>;

export const RebuildWorkspaceInputSchema = z.object({
  name: z.string(),
  pod: z.string(),
  uid: z.string(),
  repo: z.string().url({ message: 'Must be a valid URL' }),
  owner: z.string().optional(),
});
export type RebuildWorkspaceInput = z.infer<typeof RebuildWorkspaceInputSchema>;

export const ResizeWorkspaceInputSchema = z.object({
  pod: z.string(),
  uid: z.string(),
  req_cpu: K8sResourceString,
  req_mem: K8sResourceString,
  lim_cpu: K8sResourceString,
  lim_mem: K8sResourceString,
});
export type ResizeWorkspaceInput = z.infer<typeof ResizeWorkspaceInputSchema>;

export const DuplicateWorkspaceInputSchema = z.object({
  source_pod: z.string(),
  source_name: z.string(),
  new_name: z.string().max(63, 'Name must be 63 characters or fewer'),
  repo: z.string().url({ message: 'Must be a valid URL' }),
});
export type DuplicateWorkspaceInput = z.infer<typeof DuplicateWorkspaceInputSchema>;

export const SetTimerInputSchema = z.object({
  pod: z.string(),
  hours: z.number().min(0, 'Hours must be 0 or greater'),
});
export type SetTimerInput = z.infer<typeof SetTimerInputSchema>;

export const BulkActionInputSchema = z.object({
  action: z.enum(["start", "stop", "delete"]),
  workspaces: z.array(
    z.object({
      name: z.string(),
      pod: z.string(),
      uid: z.string(),
    })
  ),
});
export type BulkActionInput = z.infer<typeof BulkActionInputSchema>;

export const LoginInputSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;
