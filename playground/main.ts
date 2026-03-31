import { App } from './App'
import './global.scss'
import 'uno.css'

import { mountApp } from '../src'

mountApp(App, document.querySelector('#app')!)
