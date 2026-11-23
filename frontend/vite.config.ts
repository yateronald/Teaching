import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Locked lessons (free account, Premium) are served as outlines only: see the file.
import learnAccess from './scripts/vite-learn-access.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [learnAccess(), react()],
})
