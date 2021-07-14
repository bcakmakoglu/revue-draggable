import { createApp } from 'vue';
import App from './App.vue';
import DraggablePlugin from '../src/plugin';

const app = createApp(App);
app.use(DraggablePlugin);
app.mount('#app');
