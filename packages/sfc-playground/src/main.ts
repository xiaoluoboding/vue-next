import { createApp } from 'vue'
import App from './App.vue'
import SplitPanes from '@/components/SplitPanes'

import 'virtual:windi.css'
import 'virtual:windi-devtools'
import '@/assets/index.css'

const app = createApp(App)

app.use(SplitPanes).mount('#app')
