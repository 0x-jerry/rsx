/// <reference types="vitest" />

import path from 'path'
import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from '@/index'`,
  },
  plugins: [inspect(), uno()],
  resolve: {
    alias: {
      '@/': path.resolve('src') + '/',
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      include: ['src/**'],
    },
  },
})
