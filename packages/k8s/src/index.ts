// Client setup
export { coreV1, metricsClient, exec, kubeConfig, namespace } from './client.js'

// Pods
export {
  listWorkspacePods,
  getPod,
  createPod,
  deletePod,
  patchPodAnnotations,
  removePodAnnotations,
  getContainerResources,
  isDirectWorkspace,
  getWorkspaceName,
  getWorkspaceUid,
  isPodReady,
  buildPodSpec,
  execInPod,
} from './pods.js'
export type { BuildPodSpecOptions, DevcontainerFeature } from './pods.js'

// Services
export {
  listWorkspaceServices,
  getService,
  createService,
  deleteService,
  buildServiceSpec,
  getNodePort,
} from './services.js'

// PVCs
export {
  listWorkspacePvcs,
  listAllPvcs,
  getPvc,
  createPvc,
  deletePvc,
  buildPvcSpec,
} from './pvcs.js'

// ConfigMaps
export {
  SCHEDULES_CM,
  EXPIRY_CM,
  TEMPLATES_CM,
  DEFAULTS_CM,
  getConfigMap,
  upsertConfigMap,
  deleteConfigMap,
  listConfigMaps,
  getSchedules,
  saveSchedules,
  getExpiryDays,
  setExpiryDays,
  getPresets,
  savePresets,
  getWorkspaceDefaults,
  saveWorkspaceDefaults,
  saveWorkspaceMeta,
  getWorkspaceMeta,
  savePodSpec,
  getSavedPodSpec,
} from './configmaps.js'

// Resources (LimitRange, ResourceQuota)
export {
  getLimitRange,
  saveLimitRange,
  getResourceQuota,
  saveResourceQuota,
} from './resources.js'

// Metrics
export { getPodMetrics, parseCpuValue, parseMemValue } from './metrics.js'
export type { PodMetric } from './metrics.js'

// Events
export { getPodEvents } from './events.js'
