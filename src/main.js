import { createApp } from 'vue'
import './style.css'
import router from './router'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faMagnifyingGlass, faBars } from '@fortawesome/free-solid-svg-icons'
library.add(faUser, faMagnifyingGlass, faBars)

const app = createApp(App)

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')