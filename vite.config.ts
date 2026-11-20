import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // as fontes já são subsetadas; nada de inline em base64
    assetsInlineLimit: 0,
  },
})
