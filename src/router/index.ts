import { createRouter, createWebHistory } from 'vue-router'

import RegistrationPage from '../components/RegistrationPage.vue'
import LoginPage from '../components/LoginPage.vue'
import PrivatePage from './../components/PrivatePage.vue'

import { authToken } from '../common/auth-token'
import AuthRequest from '../common/auth-request'
import eventBus from '../common/event-bus'


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
            if (authToken().defined()) {
                if (to.fullPath == '/logout') {
                    await new AuthRequest(authToken()).logout()
                    eventBus.emit("logoutEvent")
                    return { path: '/login' }
                }
            } else {
                return { path: '/login' };
            }
        } else {
            if (authToken().defined()) {
                return { path: "/" }
            }
        }
        return true
    }
);

export default router