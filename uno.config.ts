import {
  defineConfig,
  presetMini,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { colors } from 'unocss/preset-mini'

export default defineConfig({
  presets: [presetMini()],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  theme: {
    colors: {
      primary: colors.blue,
    },
  },
})
