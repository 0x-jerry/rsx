import type { FunctionalComponent } from '../defineComponent'
import { mountApp } from '../op'

export function mountTestApp(App: FunctionalComponent) {
  const doc = document.createElement('div')
  doc.id = 'app'

  mountApp(App, doc)

  return doc
}
