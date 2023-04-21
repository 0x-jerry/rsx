import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import uno from 'unocss/vite'

export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  plugins: [inspect(), uno()],
})
