import { startScheduler } from './scheduler'
import { startExpiryChecker } from './expiry'
import { startCreationMonitor } from './creation'
import { startCleanup } from './cleanup'

console.log('[worker] Starting background worker...')
startScheduler(60_000)       // check schedules every 60s
startExpiryChecker(60_000)   // check expiry every 60s
startCreationMonitor(3_000)  // poll creating pods every 3s
startCleanup(300_000)        // cleanup orphans every 5min
console.log('[worker] All loops started')
