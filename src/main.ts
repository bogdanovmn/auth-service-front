import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import AuthRequest from './common/auth-request'
import { createAuthTokenInstance } from './common/auth-token'


const authToken = createAuthTokenInstance("http://localhost:8091")

createApp(App)
    .use(router)
    .provide("authToken", authToken)
    .provide(
        "http",
        new AuthRequest(
            authToken,
            () => {
                console.log("auto logout...");
                router.push("/logout")
            }
        )
    )
    .mount('#app')
