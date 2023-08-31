import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { AuthHttpClient } from './common/auth-http-client'
import { SsoResourcesService } from './common/sso-resources-service'
import { SsoService } from './common/sso-service'


const ssoService = new SsoService(import.meta.env.VITE_SSO_SERVICE_URL)
const authHttpClient = new AuthHttpClient(
    ssoService,
    () => {
        console.log("auto logout...");
        router.push("/logout")
    }
)
const ssoResourceService = new SsoResourcesService(import.meta.env.VITE_SSO_SERVICE_URL, authHttpClient)

createApp(App)
    .use(router)
    .provide("ssoResourceService", ssoResourceService)
    .provide("ssoService", ssoService)
    .mount('#app')
