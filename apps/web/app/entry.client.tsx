import { StartClient } from '@tanstack/react-start'
import { hydrateRoot } from 'react-dom/client'

const root = document.getElementById('root')!
hydrateRoot(root, <StartClient />)
