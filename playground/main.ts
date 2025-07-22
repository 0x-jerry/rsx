import { App } from './App'
import './global.scss'
import 'uno.css'

import { mountApp } from '@/index'

const app = mountApp(App, '#app')
console.log(app)
