import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createRouter } from './router'
import { startStatsCollection } from './server/stats'

// Start background stats collection when the server starts
startStatsCollection()

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
