import { createRouter, createWebHistory } from 'vue-router'
import RegistrationPage from '../components/RegistrationPage.vue'
import LoginPage from '../components/LoginPage.vue'
import PrivatePage from './../components/PrivatePage.vue'
import eventBus from '../common/event-bus'

import { SsoService, tokenStorage } from "@bogdanovmn/ssofw"


const ssoService = new SsoService(import.meta.env.VITE_SSO_SERVICE_URL)

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/login",        component: LoginPage },
        { path: "/registration", component: RegistrationPage },
        { path: "/",             component: PrivatePage, meta: { private: true } },
        { path: "/logout",       component: PrivatePage, meta: { private: true } }
    ]
})

router.beforeEach(
    async (to: any) => {
        if (to.matched.some((route: any) => route.meta.private)) {
            if (tokenStorage.defined()) {
                if (to.fullPath == '/logout') {
                    await ssoService.deleteRefreshToken()
                    eventBus.emit("logoutEvent")
                    return { path: '/login' }
                }
            } else {
                return { path: '/login' };
            }
        } else {
            if (tokenStorage.defined()) {
                return { path: "/" }
            }
        }
        return true
    }
);

export default router