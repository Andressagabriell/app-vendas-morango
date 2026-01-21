// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa nosso "GPS"

const app = createApp(App)

app.use(router) // Diz ao app para usar o "GPS"

app.mount('#app')
