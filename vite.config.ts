/// <reference types="vitest/config" />

import path from 'path'
import uno from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'classic',
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
    jsxInject: `import { h, Fragment } from '@/index'`,
  },
  plugins: [uno()],
  resolve: {
    alias: {
      '@/': `${path.resolve('src')}/`,
    },
  },
  css: {
    modules: {
      generateScopedName: (name) => `r-${name}`,
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