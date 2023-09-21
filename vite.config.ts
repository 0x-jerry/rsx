/// <reference types="vitest" />

import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import uno from 'unocss/vite'
import path from 'path'
import { babel } from '@rollup/plugin-babel'
import { jsxPlugin } from './bable/jsx'

export default defineConfig({
  // esbuild: {
  //   jsx: 'transform',
  //   jsxFactory: 'h',
  //   jsxFragment: 'Fragment',
  //   jsxInject: `import { h, Fragment } from '@/core'`,
  // },
  plugins: [
    inspect(),
    uno(),
    babel({
      extensions: ['tsx', 'jsx'],
      plugins: [
        [jsxPlugin, {}],
        [
          '@babel/plugin-transform-react-jsx',
          {
            runtime: 'automatic',
            importSource: `@`
          },
        ],
      ],
    }),
  ],
  resolve: {
    alias: {
      '@/': path.resolve('src') + '/',
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
