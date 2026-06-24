import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: '@/api/client',
        replacement: path.resolve(
          __dirname,
          mode === 'test' ? './src/api/fixtures/client.mock.ts' : './src/api/client.ts',
        ),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
}))
