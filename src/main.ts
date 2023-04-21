import { App } from './App'
import 'uno.css'

import { h, mountApp } from './core'

const app = h(App)

console.log(app._)

mountApp(app, '#app')
