import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import AuthRequest from './common/auth-request'
import AuthToken from './common/auth-token'

createApp(App)
    .use(router)
    .provide(
        "http",
        new AuthRequest(
            new AuthToken("http://localhost:8091")
        )
    )
    .mount('#app')
