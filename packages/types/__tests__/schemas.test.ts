import { describe, test, expect } from "bun:test";
import {
  // Workspace
  ResourcesSchema,
  UsageSchema,
  WorkspaceSchema,
  EventSchema,
  PvcSchema,
  ContainerSchema,
  PvcUsageSchema,
  WorkspaceDetailSchema,
  GitInfoSchema,
  CreationLogSchema,
  ApiResponseSchema,
  UserSchema,
  CreateWorkspaceInputSchema,
  StopWorkspaceInputSchema,
  StartWorkspaceInputSchema,
  DeleteWorkspaceInputSchema,
  RebuildWorkspaceInputSchema,
  ResizeWorkspaceInputSchema,
  DuplicateWorkspaceInputSchema,
  SetTimerInputSchema,
  BulkActionInputSchema,
  LoginInputSchema,
  // Settings
  ProviderSettingsSchema,
  LimitRangeSchema,
  QuotaSchema,
  SettingsSchema,
  WorkspaceDefaultsSchema,
  SaveLimitRangeInputSchema,
  SaveQuotaInputSchema,
  SaveDefaultsInputSchema,
  // Schedule
  ScheduleSchema,
  SetScheduleInputSchema,
  RemoveScheduleInputSchema,
  ExpirySchema,
  SetExpiryInputSchema,
  // Preset
  PresetSchema,
  SavePresetInputSchema,
  DeletePresetInputSchema,
  CreateFromPresetInputSchema,
  // Stats
  MemInfoSchema,
  SwapInfoSchema,
  DiskInfoSchema,
  ProcessInfoSchema,
  SystemStatsSchema,
  UsageEntrySchema,
} from "../src/index.js";

// ============================================================
// Workspace schemas
// ============================================================

describe("ResourcesSchema", () => {
  test("parses valid resources", () => {
    const data = { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" };
    expect(ResourcesSchema.parse(data)).toEqual(data);
  });

  test("accepts empty string values", () => {
    const data = { req_cpu: "", req_mem: "", lim_cpu: "", lim_mem: "" };
    expect(ResourcesSchema.parse(data)).toEqual(data);
  });

  test("rejects missing fields", () => {
    expect(() => ResourcesSchema.parse({ req_cpu: "500m" })).toThrow();
  });

  test("rejects non-string values", () => {
    expect(() =>
      ResourcesSchema.parse({ req_cpu: 500, req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" })
    ).toThrow();
  });
});

describe("UsageSchema", () => {
  test("parses valid usage", () => {
    const data = { cpu: "250m", memory: "512Mi" };
    expect(UsageSchema.parse(data)).toEqual(data);
  });

  test("accepts empty strings", () => {
    const data = { cpu: "", memory: "" };
    expect(UsageSchema.parse(data)).toEqual(data);
  });

  test("rejects missing memory field", () => {
    expect(() => UsageSchema.parse({ cpu: "100m" })).toThrow();
  });
});

describe("WorkspaceSchema", () => {
  const validWorkspace = {
    name: "my-workspace",
    status: "Running",
    port: 30001,
    pod: "ws-my-workspace",
    uid: "a1b2c3d4",
    running: true,
    creating: false,
    shutdown_at: "2026-02-17T12:00:00Z",
    shutdown_hours: "4",
    repo: "https://github.com/user/repo.git",
    branch: "main",
    dirty: false,
    last_commit: "abc123",
    owner: "admin",
    last_accessed: "2026-02-17T10:00:00Z",
    expiry_warning: "",
  };

  test("parses valid workspace without optional fields", () => {
    const result = WorkspaceSchema.parse(validWorkspace);
    expect(result.name).toBe("my-workspace");
    expect(result.status).toBe("Running");
    expect(result.port).toBe(30001);
    expect(result.running).toBe(true);
    expect(result.resources).toBeUndefined();
    expect(result.usage).toBeUndefined();
  });

  test("parses workspace with optional resources and usage", () => {
    const data = {
      ...validWorkspace,
      resources: { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" },
      usage: { cpu: "250m", memory: "512Mi" },
    };
    const result = WorkspaceSchema.parse(data);
    expect(result.resources).toBeDefined();
    expect(result.resources!.req_cpu).toBe("500m");
    expect(result.usage).toBeDefined();
    expect(result.usage!.cpu).toBe("250m");
  });

  test("handles port 0 for stopped workspaces", () => {
    const data = { ...validWorkspace, port: 0, running: false, status: "Stopped" };
    const result = WorkspaceSchema.parse(data);
    expect(result.port).toBe(0);
    expect(result.running).toBe(false);
  });

  test("handles empty shutdown_at and shutdown_hours", () => {
    const data = { ...validWorkspace, shutdown_at: "", shutdown_hours: "" };
    const result = WorkspaceSchema.parse(data);
    expect(result.shutdown_at).toBe("");
    expect(result.shutdown_hours).toBe("");
  });

  test("handles empty last_accessed", () => {
    const data = { ...validWorkspace, last_accessed: "" };
    expect(WorkspaceSchema.parse(data).last_accessed).toBe("");
  });

  test("rejects missing name", () => {
    const { name, ...noName } = validWorkspace;
    expect(() => WorkspaceSchema.parse(noName)).toThrow();
  });

  test("rejects non-boolean running", () => {
    expect(() => WorkspaceSchema.parse({ ...validWorkspace, running: "yes" })).toThrow();
  });

  test("rejects non-number port", () => {
    expect(() => WorkspaceSchema.parse({ ...validWorkspace, port: "30001" })).toThrow();
  });
});

describe("EventSchema", () => {
  test("parses valid event", () => {
    const data = { type: "Normal", reason: "Scheduled", age: "5m", message: "Pod assigned" };
    expect(EventSchema.parse(data)).toEqual(data);
  });

  test("rejects missing fields", () => {
    expect(() => EventSchema.parse({ type: "Normal" })).toThrow();
  });
});

describe("PvcSchema", () => {
  test("parses valid PVC", () => {
    const data = { name: "ws-data", capacity: "10Gi", status: "Bound", storage_class: "standard" };
    expect(PvcSchema.parse(data)).toEqual(data);
  });
});

describe("ContainerSchema", () => {
  test("parses valid container", () => {
    const data = {
      name: "workspace",
      image: "ubuntu:22.04",
      ready: true,
      restart_count: 0,
      state: { running: { startedAt: "2026-02-17T10:00:00Z" } },
      requests: { cpu: "500m", memory: "1Gi" },
      limits: { cpu: "1", memory: "2Gi" },
    };
    const result = ContainerSchema.parse(data);
    expect(result.name).toBe("workspace");
    expect(result.ready).toBe(true);
    expect(result.restart_count).toBe(0);
  });

  test("handles empty state/requests/limits objects", () => {
    const data = {
      name: "init",
      image: "busybox",
      ready: false,
      restart_count: 3,
      state: {},
      requests: {},
      limits: {},
    };
    expect(ContainerSchema.parse(data)).toEqual(data);
  });

  test("rejects non-boolean ready", () => {
    expect(() =>
      ContainerSchema.parse({
        name: "x",
        image: "x",
        ready: 1,
        restart_count: 0,
        state: {},
        requests: {},
        limits: {},
      })
    ).toThrow();
  });
});

describe("PvcUsageSchema", () => {
  test("parses full PVC usage", () => {
    const data = {
      total: "10Gi",
      used: "5Gi",
      available: "5Gi",
      percent: 50,
      total_raw: 10737418240,
      used_raw: 5368709120,
    };
    expect(PvcUsageSchema.parse(data)).toEqual(data);
  });

  test("parses empty object (no PVC usage available)", () => {
    expect(PvcUsageSchema.parse({})).toEqual({});
  });

  test("rejects partial PVC usage (missing fields)", () => {
    expect(() => PvcUsageSchema.parse({ total: "10Gi" })).toThrow();
  });
});

describe("WorkspaceDetailSchema", () => {
  const validDetail = {
    name: "my-workspace",
    status: "Running",
    pod: "ws-my-workspace",
    events: [{ type: "Normal", reason: "Started", age: "2m", message: "Container started" }],
    pvcs: [{ name: "ws-data", capacity: "10Gi", status: "Bound", storage_class: "standard" }],
    containers: [
      {
        name: "workspace",
        image: "ubuntu:22.04",
        ready: true,
        restart_count: 0,
        state: { running: {} },
        requests: { cpu: "500m" },
        limits: { cpu: "1" },
      },
    ],
    usage: { cpu: "250m", memory: "512Mi" },
    repo: "https://github.com/user/repo.git",
    running: true,
    creating: false,
    uid: "abc123",
    pod_ip: "10.244.0.5",
    node: "node-1",
    phase: "Running",
    conditions: [{ type: "Ready", status: "True" }],
    age: "2h",
    resources: { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" },
    branch: "main",
    dirty: false,
    last_commit: "abc123def",
    pvc_usage: {
      total: "10Gi",
      used: "3Gi",
      available: "7Gi",
      percent: 30,
      total_raw: 10737418240,
      used_raw: 3221225472,
    },
    owner: "admin",
    last_accessed: "2026-02-17T10:00:00Z",
    expiry_warning: "",
  };

  test("parses full workspace detail", () => {
    const result = WorkspaceDetailSchema.parse(validDetail);
    expect(result.name).toBe("my-workspace");
    expect(result.events).toHaveLength(1);
    expect(result.pvcs).toHaveLength(1);
    expect(result.containers).toHaveLength(1);
    expect(result.pod_ip).toBe("10.244.0.5");
  });

  test("accepts null pod", () => {
    const data = { ...validDetail, pod: null };
    expect(WorkspaceDetailSchema.parse(data).pod).toBeNull();
  });

  test("accepts null usage", () => {
    const data = { ...validDetail, usage: null };
    expect(WorkspaceDetailSchema.parse(data).usage).toBeNull();
  });

  test("accepts empty pvc_usage object", () => {
    const data = { ...validDetail, pvc_usage: {} };
    expect(WorkspaceDetailSchema.parse(data).pvc_usage).toEqual({});
  });

  test("accepts empty arrays for events, pvcs, containers, conditions", () => {
    const data = {
      ...validDetail,
      events: [],
      pvcs: [],
      containers: [],
      conditions: [],
    };
    const result = WorkspaceDetailSchema.parse(data);
    expect(result.events).toEqual([]);
    expect(result.pvcs).toEqual([]);
    expect(result.containers).toEqual([]);
    expect(result.conditions).toEqual([]);
  });

  test("rejects missing required fields", () => {
    const { name, ...noName } = validDetail;
    expect(() => WorkspaceDetailSchema.parse(noName)).toThrow();
  });
});

describe("GitInfoSchema", () => {
  test("parses valid git info", () => {
    const data = { repo: "https://github.com/user/repo.git", branch: "main", dirty: false, last_commit: "abc123" };
    expect(GitInfoSchema.parse(data)).toEqual(data);
  });

  test("handles empty strings", () => {
    const data = { repo: "", branch: "", dirty: false, last_commit: "" };
    expect(GitInfoSchema.parse(data)).toEqual(data);
  });
});

describe("CreationLogSchema", () => {
  test("parses valid creation log", () => {
    const data = { lines: ["Cloning repo...", "Building image...", "Done."], status: "complete" };
    expect(CreationLogSchema.parse(data)).toEqual(data);
  });

  test("handles empty lines array", () => {
    const data = { lines: [], status: "pending" };
    expect(CreationLogSchema.parse(data)).toEqual(data);
  });

  test("rejects missing status", () => {
    expect(() => CreationLogSchema.parse({ lines: [] })).toThrow();
  });
});

describe("ApiResponseSchema", () => {
  test("parses success response", () => {
    const data = { ok: true, message: "Workspace created" };
    expect(ApiResponseSchema.parse(data)).toEqual(data);
  });

  test("parses error response", () => {
    const data = { ok: false, message: "Failed to create workspace" };
    expect(ApiResponseSchema.parse(data)).toEqual(data);
  });

  test("rejects missing ok field", () => {
    expect(() => ApiResponseSchema.parse({ message: "hello" })).toThrow();
  });
});

describe("UserSchema", () => {
  test("parses valid user", () => {
    const data = { password: "hashed_pw", role: "admin", prefixes: ["dev-", "staging-"] };
    expect(UserSchema.parse(data)).toEqual(data);
  });

  test("handles empty prefixes array", () => {
    const data = { password: "pw", role: "user", prefixes: [] };
    expect(UserSchema.parse(data)).toEqual(data);
  });

  test("rejects non-array prefixes", () => {
    expect(() => UserSchema.parse({ password: "pw", role: "user", prefixes: "dev-" })).toThrow();
  });
});

// ============================================================
// Workspace input schemas
// ============================================================

describe("CreateWorkspaceInputSchema", () => {
  test("parses with required fields only", () => {
    const data = { repo: "https://github.com/user/repo.git" };
    const result = CreateWorkspaceInputSchema.parse(data);
    expect(result.repo).toBe("https://github.com/user/repo.git");
    expect(result.name).toBeUndefined();
    expect(result.owner).toBeUndefined();
  });

  test("parses with all fields", () => {
    const data = { repo: "https://github.com/user/repo.git", name: "my-ws", owner: "admin" };
    expect(CreateWorkspaceInputSchema.parse(data)).toEqual(data);
  });

  test("rejects missing repo", () => {
    expect(() => CreateWorkspaceInputSchema.parse({ name: "my-ws" })).toThrow();
  });
});

describe("StopWorkspaceInputSchema", () => {
  test("parses valid input", () => {
    expect(StopWorkspaceInputSchema.parse({ pod: "ws-test" })).toEqual({ pod: "ws-test" });
  });

  test("rejects empty object", () => {
    expect(() => StopWorkspaceInputSchema.parse({})).toThrow();
  });
});

describe("StartWorkspaceInputSchema", () => {
  test("parses valid input", () => {
    expect(StartWorkspaceInputSchema.parse({ pod: "ws-test" })).toEqual({ pod: "ws-test" });
  });
});

describe("DeleteWorkspaceInputSchema", () => {
  test("parses valid input", () => {
    const data = { name: "my-ws", pod: "ws-my-ws", uid: "abc123" };
    expect(DeleteWorkspaceInputSchema.parse(data)).toEqual(data);
  });

  test("rejects missing uid", () => {
    expect(() => DeleteWorkspaceInputSchema.parse({ name: "my-ws", pod: "ws-my-ws" })).toThrow();
  });
});

describe("RebuildWorkspaceInputSchema", () => {
  test("parses without optional owner", () => {
    const data = { name: "ws", pod: "ws-ws", uid: "123", repo: "https://github.com/u/r.git" };
    const result = RebuildWorkspaceInputSchema.parse(data);
    expect(result.owner).toBeUndefined();
  });

  test("parses with owner", () => {
    const data = { name: "ws", pod: "ws-ws", uid: "123", repo: "https://github.com/u/r.git", owner: "admin" };
    expect(RebuildWorkspaceInputSchema.parse(data).owner).toBe("admin");
  });
});

describe("ResizeWorkspaceInputSchema", () => {
  test("parses valid resize input", () => {
    const data = {
      pod: "ws-test",
      uid: "abc",
      req_cpu: "500m",
      req_mem: "1Gi",
      lim_cpu: "1",
      lim_mem: "2Gi",
    };
    expect(ResizeWorkspaceInputSchema.parse(data)).toEqual(data);
  });
});

describe("DuplicateWorkspaceInputSchema", () => {
  test("parses valid duplicate input", () => {
    const data = {
      source_pod: "ws-original",
      source_name: "original",
      new_name: "copy",
      repo: "https://github.com/u/r.git",
    };
    expect(DuplicateWorkspaceInputSchema.parse(data)).toEqual(data);
  });
});

describe("SetTimerInputSchema", () => {
  test("parses valid timer input", () => {
    const data = { pod: "ws-test", hours: 4 };
    expect(SetTimerInputSchema.parse(data)).toEqual(data);
  });

  test("accepts 0 hours (disable timer)", () => {
    const data = { pod: "ws-test", hours: 0 };
    expect(SetTimerInputSchema.parse(data).hours).toBe(0);
  });

  test("rejects non-number hours", () => {
    expect(() => SetTimerInputSchema.parse({ pod: "ws-test", hours: "4" })).toThrow();
  });
});

describe("BulkActionInputSchema", () => {
  test("parses valid bulk start", () => {
    const data = {
      action: "start" as const,
      workspaces: [
        { name: "ws1", pod: "ws-ws1", uid: "aaa" },
        { name: "ws2", pod: "ws-ws2", uid: "bbb" },
      ],
    };
    const result = BulkActionInputSchema.parse(data);
    expect(result.action).toBe("start");
    expect(result.workspaces).toHaveLength(2);
  });

  test("parses valid bulk delete", () => {
    const data = {
      action: "delete" as const,
      workspaces: [{ name: "ws1", pod: "ws-ws1", uid: "aaa" }],
    };
    expect(BulkActionInputSchema.parse(data).action).toBe("delete");
  });

  test("rejects invalid action", () => {
    expect(() =>
      BulkActionInputSchema.parse({ action: "restart", workspaces: [] })
    ).toThrow();
  });

  test("accepts empty workspaces array", () => {
    const data = { action: "stop" as const, workspaces: [] };
    expect(BulkActionInputSchema.parse(data).workspaces).toEqual([]);
  });
});

describe("LoginInputSchema", () => {
  test("parses valid login", () => {
    const data = { username: "admin", password: "secret" };
    expect(LoginInputSchema.parse(data)).toEqual(data);
  });

  test("rejects missing password", () => {
    expect(() => LoginInputSchema.parse({ username: "admin" })).toThrow();
  });
});

// ============================================================
// Settings schemas
// ============================================================

describe("ProviderSettingsSchema", () => {
  test("parses valid provider settings", () => {
    const data = { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" };
    expect(ProviderSettingsSchema.parse(data)).toEqual(data);
  });
});

describe("LimitRangeSchema", () => {
  test("parses valid limit range", () => {
    const data = {
      max_cpu: "4",
      max_mem: "8Gi",
      def_cpu: "1",
      def_mem: "2Gi",
      def_req_cpu: "500m",
      def_req_mem: "1Gi",
    };
    expect(LimitRangeSchema.parse(data)).toEqual(data);
  });

  test("accepts all empty strings", () => {
    const data = {
      max_cpu: "",
      max_mem: "",
      def_cpu: "",
      def_mem: "",
      def_req_cpu: "",
      def_req_mem: "",
    };
    expect(LimitRangeSchema.parse(data)).toEqual(data);
  });
});

describe("QuotaSchema", () => {
  test("parses valid quota", () => {
    const data = {
      req_cpu: "10",
      req_mem: "20Gi",
      pods: "50",
      used_req_cpu: "3",
      used_req_mem: "6Gi",
      used_pods: "12",
    };
    expect(QuotaSchema.parse(data)).toEqual(data);
  });
});

describe("SettingsSchema", () => {
  test("parses full settings", () => {
    const data = {
      provider: { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" },
      limitrange: {
        max_cpu: "4",
        max_mem: "8Gi",
        def_cpu: "1",
        def_mem: "2Gi",
        def_req_cpu: "500m",
        def_req_mem: "1Gi",
      },
      quota: {
        req_cpu: "10",
        req_mem: "20Gi",
        pods: "50",
        used_req_cpu: "3",
        used_req_mem: "6Gi",
        used_pods: "12",
      },
    };
    const result = SettingsSchema.parse(data);
    expect(result.provider.req_cpu).toBe("500m");
    expect(result.limitrange.max_cpu).toBe("4");
    expect(result.quota.pods).toBe("50");
  });

  test("applies defaults when fields are omitted", () => {
    const result = SettingsSchema.parse({});
    expect(result.provider).toEqual({ req_cpu: "", req_mem: "", lim_cpu: "", lim_mem: "" });
    expect(result.limitrange).toEqual({
      max_cpu: "",
      max_mem: "",
      def_cpu: "",
      def_mem: "",
      def_req_cpu: "",
      def_req_mem: "",
    });
    expect(result.quota).toEqual({
      req_cpu: "",
      req_mem: "",
      pods: "",
      used_req_cpu: "",
      used_req_mem: "",
      used_pods: "",
    });
  });
});

describe("WorkspaceDefaultsSchema", () => {
  test("parses valid defaults", () => {
    const data = { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" };
    expect(WorkspaceDefaultsSchema.parse(data)).toEqual(data);
  });
});

describe("SaveLimitRangeInputSchema", () => {
  test("parses valid input", () => {
    const data = {
      max_cpu: "4",
      max_mem: "8Gi",
      def_cpu: "1",
      def_mem: "2Gi",
      def_req_cpu: "500m",
      def_req_mem: "1Gi",
    };
    expect(SaveLimitRangeInputSchema.parse(data)).toEqual(data);
  });
});

describe("SaveQuotaInputSchema", () => {
  test("parses valid input", () => {
    const data = { req_cpu: "10", req_mem: "20Gi", pods: "50" };
    expect(SaveQuotaInputSchema.parse(data)).toEqual(data);
  });

  test("rejects extra used_ fields (not in save input)", () => {
    // SaveQuotaInput does not include used_ fields - they are read-only
    const data = { req_cpu: "10", req_mem: "20Gi", pods: "50", used_req_cpu: "3" };
    // Zod strips unknown keys by default, so this should still parse
    const result = SaveQuotaInputSchema.parse(data);
    expect(result).toEqual({ req_cpu: "10", req_mem: "20Gi", pods: "50" });
  });
});

describe("SaveDefaultsInputSchema", () => {
  test("parses valid input", () => {
    const data = { req_cpu: "500m", req_mem: "1Gi", lim_cpu: "1", lim_mem: "2Gi" };
    expect(SaveDefaultsInputSchema.parse(data)).toEqual(data);
  });
});

// ============================================================
// Schedule schemas
// ============================================================

describe("ScheduleSchema", () => {
  test("parses valid schedule", () => {
    const data = {
      workspace: "my-ws",
      pod_name: "ws-my-ws",
      action: "start" as const,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      hour: 9,
      minute: 0,
    };
    expect(ScheduleSchema.parse(data)).toEqual(data);
  });

  test("accepts stop action", () => {
    const data = {
      workspace: "my-ws",
      pod_name: "ws-my-ws",
      action: "stop" as const,
      days: ["Fri"],
      hour: 18,
      minute: 30,
    };
    expect(ScheduleSchema.parse(data).action).toBe("stop");
  });

  test("rejects invalid action", () => {
    expect(() =>
      ScheduleSchema.parse({
        workspace: "ws",
        pod_name: "ws-ws",
        action: "restart",
        days: [],
        hour: 0,
        minute: 0,
      })
    ).toThrow();
  });

  test("rejects hour out of range", () => {
    expect(() =>
      ScheduleSchema.parse({
        workspace: "ws",
        pod_name: "ws-ws",
        action: "start",
        days: ["Mon"],
        hour: 24,
        minute: 0,
      })
    ).toThrow();
  });

  test("rejects negative hour", () => {
    expect(() =>
      ScheduleSchema.parse({
        workspace: "ws",
        pod_name: "ws-ws",
        action: "start",
        days: ["Mon"],
        hour: -1,
        minute: 0,
      })
    ).toThrow();
  });

  test("rejects minute out of range", () => {
    expect(() =>
      ScheduleSchema.parse({
        workspace: "ws",
        pod_name: "ws-ws",
        action: "stop",
        days: ["Mon"],
        hour: 12,
        minute: 60,
      })
    ).toThrow();
  });

  test("accepts boundary values for hour and minute", () => {
    const data = {
      workspace: "ws",
      pod_name: "ws-ws",
      action: "start" as const,
      days: ["Sun"],
      hour: 0,
      minute: 0,
    };
    expect(ScheduleSchema.parse(data).hour).toBe(0);

    const data2 = { ...data, hour: 23, minute: 59 };
    expect(ScheduleSchema.parse(data2).hour).toBe(23);
    expect(ScheduleSchema.parse(data2).minute).toBe(59);
  });

  test("accepts empty days array", () => {
    const data = {
      workspace: "ws",
      pod_name: "ws-ws",
      action: "start" as const,
      days: [],
      hour: 9,
      minute: 0,
    };
    expect(ScheduleSchema.parse(data).days).toEqual([]);
  });
});

describe("SetScheduleInputSchema", () => {
  test("parses valid set schedule input", () => {
    const data = {
      workspace: "my-ws",
      pod_name: "ws-my-ws",
      action: "start" as const,
      days: ["Mon"],
      hour: 8,
      minute: 30,
    };
    expect(SetScheduleInputSchema.parse(data)).toEqual(data);
  });
});

describe("RemoveScheduleInputSchema", () => {
  test("parses valid remove schedule input", () => {
    const data = { workspace: "my-ws", action: "stop" as const };
    expect(RemoveScheduleInputSchema.parse(data)).toEqual(data);
  });

  test("rejects invalid action", () => {
    expect(() => RemoveScheduleInputSchema.parse({ workspace: "ws", action: "pause" })).toThrow();
  });
});

describe("ExpirySchema", () => {
  test("parses valid expiry", () => {
    expect(ExpirySchema.parse({ days: 30 })).toEqual({ days: 30 });
  });

  test("accepts 0 (disabled)", () => {
    expect(ExpirySchema.parse({ days: 0 }).days).toBe(0);
  });

  test("rejects negative days", () => {
    expect(() => ExpirySchema.parse({ days: -1 })).toThrow();
  });

  test("rejects non-integer days", () => {
    expect(() => ExpirySchema.parse({ days: 1.5 })).toThrow();
  });
});

describe("SetExpiryInputSchema", () => {
  test("parses valid set expiry input", () => {
    expect(SetExpiryInputSchema.parse({ days: 7 })).toEqual({ days: 7 });
  });
});

// ============================================================
// Preset schemas
// ============================================================

describe("PresetSchema", () => {
  const validPreset = {
    id: "preset-1",
    name: "Python Dev",
    description: "Python development environment",
    repo_url: "https://github.com/user/python-template.git",
    req_cpu: "500m",
    req_mem: "1Gi",
    lim_cpu: "2",
    lim_mem: "4Gi",
  };

  test("parses valid preset", () => {
    expect(PresetSchema.parse(validPreset)).toEqual(validPreset);
  });

  test("accepts empty strings for description", () => {
    const data = { ...validPreset, description: "" };
    expect(PresetSchema.parse(data).description).toBe("");
  });

  test("rejects missing id", () => {
    const { id, ...noId } = validPreset;
    expect(() => PresetSchema.parse(noId)).toThrow();
  });
});

describe("SavePresetInputSchema", () => {
  test("parses valid save preset input", () => {
    const data = {
      name: "Go Dev",
      description: "Go development environment",
      repo_url: "https://github.com/user/go-template.git",
      req_cpu: "1",
      req_mem: "2Gi",
      lim_cpu: "4",
      lim_mem: "8Gi",
    };
    expect(SavePresetInputSchema.parse(data)).toEqual(data);
  });
});

describe("DeletePresetInputSchema", () => {
  test("parses valid delete preset input", () => {
    expect(DeletePresetInputSchema.parse({ id: "preset-1" })).toEqual({ id: "preset-1" });
  });

  test("rejects missing id", () => {
    expect(() => DeletePresetInputSchema.parse({})).toThrow();
  });
});

describe("CreateFromPresetInputSchema", () => {
  test("parses with preset_id only", () => {
    const result = CreateFromPresetInputSchema.parse({ preset_id: "preset-1" });
    expect(result.preset_id).toBe("preset-1");
    expect(result.name).toBeUndefined();
  });

  test("parses with optional name", () => {
    const data = { preset_id: "preset-1", name: "my-python-ws" };
    expect(CreateFromPresetInputSchema.parse(data)).toEqual(data);
  });
});

// ============================================================
// Stats schemas
// ============================================================

describe("MemInfoSchema", () => {
  test("parses valid memory info", () => {
    const data = { total: 16384000, used: 8192000, buffers: 512000, cached: 4096000, available: 8192000 };
    expect(MemInfoSchema.parse(data)).toEqual(data);
  });

  test("accepts zero values", () => {
    const data = { total: 0, used: 0, buffers: 0, cached: 0, available: 0 };
    expect(MemInfoSchema.parse(data)).toEqual(data);
  });

  test("rejects string values", () => {
    expect(() =>
      MemInfoSchema.parse({ total: "16384000", used: 0, buffers: 0, cached: 0, available: 0 })
    ).toThrow();
  });
});

describe("SwapInfoSchema", () => {
  test("parses valid swap info", () => {
    const data = { total: 4096000, used: 1024000 };
    expect(SwapInfoSchema.parse(data)).toEqual(data);
  });

  test("accepts zero swap", () => {
    expect(SwapInfoSchema.parse({ total: 0, used: 0 })).toEqual({ total: 0, used: 0 });
  });
});

describe("DiskInfoSchema", () => {
  test("parses valid disk info", () => {
    const data = { total: 1073741824, used: 536870912, available: 536870912 };
    expect(DiskInfoSchema.parse(data)).toEqual(data);
  });
});

describe("ProcessInfoSchema", () => {
  test("parses valid process info", () => {
    const data = { pid: "1234", user: "root", cpu: "5.2", mem: "3.1", rss: 65536, cmd: "/usr/bin/node" };
    expect(ProcessInfoSchema.parse(data)).toEqual(data);
  });

  test("rejects numeric pid (must be string)", () => {
    expect(() =>
      ProcessInfoSchema.parse({ pid: 1234, user: "root", cpu: "5.2", mem: "3.1", rss: 65536, cmd: "node" })
    ).toThrow();
  });
});

describe("SystemStatsSchema", () => {
  const validStats = {
    cpu: { cpu0: 25.5, cpu1: 30.2, cpu2: 15.8, cpu3: 20.1 },
    ncpu: 4,
    mem: { total: 16384000, used: 8192000, buffers: 512000, cached: 4096000, available: 8192000 },
    swap: { total: 4096000, used: 1024000 },
    load: [1.5, 2.0, 1.8] as [number, number, number],
    tasks: "150 total, 2 running",
    uptime: "5 days, 3:42",
    disk: { total: 1073741824, used: 536870912, available: 536870912 },
    procs: [
      { pid: "1", user: "root", cpu: "0.1", mem: "0.5", rss: 32768, cmd: "/sbin/init" },
      { pid: "100", user: "node", cpu: "12.5", mem: "8.2", rss: 524288, cmd: "node server.js" },
    ],
  };

  test("parses valid system stats", () => {
    const result = SystemStatsSchema.parse(validStats);
    expect(result.ncpu).toBe(4);
    expect(result.cpu["cpu0"]).toBe(25.5);
    expect(result.load).toEqual([1.5, 2.0, 1.8]);
    expect(result.procs).toHaveLength(2);
  });

  test("accepts empty cpu record", () => {
    const data = { ...validStats, cpu: {} };
    expect(SystemStatsSchema.parse(data).cpu).toEqual({});
  });

  test("accepts empty procs array", () => {
    const data = { ...validStats, procs: [] };
    expect(SystemStatsSchema.parse(data).procs).toEqual([]);
  });

  test("rejects load with wrong tuple length", () => {
    const data = { ...validStats, load: [1.5, 2.0] };
    expect(() => SystemStatsSchema.parse(data)).toThrow();
  });

  test("rejects load with 4 elements", () => {
    const data = { ...validStats, load: [1.5, 2.0, 1.8, 1.2] };
    expect(() => SystemStatsSchema.parse(data)).toThrow();
  });
});

describe("UsageEntrySchema", () => {
  test("parses valid usage entry", () => {
    const data = { timestamp: 1708185600, cpu_mc: 500, mem_bytes: 1073741824 };
    expect(UsageEntrySchema.parse(data)).toEqual(data);
  });

  test("accepts zero values", () => {
    const data = { timestamp: 0, cpu_mc: 0, mem_bytes: 0 };
    expect(UsageEntrySchema.parse(data)).toEqual(data);
  });

  test("rejects string timestamp", () => {
    expect(() =>
      UsageEntrySchema.parse({ timestamp: "1708185600", cpu_mc: 500, mem_bytes: 1073741824 })
    ).toThrow();
  });
});
