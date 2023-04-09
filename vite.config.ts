import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  esbuild: {
    "jsx": "transform",
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  plugins: [inspect()]
})
