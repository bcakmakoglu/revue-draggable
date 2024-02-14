import 'virtual:windi.css'
import 'virtual:windi-devtools'
import { createApp } from 'vue-demi'
import DraggablePlugin from '../src/plugin'
import App from './App.vue'

const app = createApp(App)
app.use(DraggablePlugin)
app.mount('#app')
