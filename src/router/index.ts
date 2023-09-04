import { inject } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import RegistrationPage from '../components/RegistrationPage.vue'
import LoginPage from '../components/LoginPage.vue'
import ManagmentPage from './../components/ManagementPage.vue'
import ErrorPage from './../components/ErrorPage.vue'

import { eventBus, Event } from '../common/event-bus'
import { SsoService, tokenStorage } from "@bogdanovmn/ssofw"


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/login",        component: LoginPage },
        { path: "/registration", component: RegistrationPage },
        { path: "/managment",    component: ManagmentPage, meta: { private: true } },
        { path: "/error",        component: ErrorPage, meta: { private: true } },
        { path: "/logout",       component: LoginPage, meta: { private: true } }
    ]
})

router.beforeEach(
    async (to: any) => {
        const ssoService = inject<SsoService>("ssoService")!
        const privateTarget = to.matched.some((route: any) => route.meta.private)
        const isAuthenticated = tokenStorage.defined()
        const isAdmin = tokenStorage.claims?.isSuperAdmin()

        // console.log(`routing to ${to.fullPath} auth: ${isAuthenticated} isAdmin: ${isAdmin}`)
        
        if (to.fullPath == "/error") {
            return true
        }
        if (isAuthenticated) {
            if (!privateTarget) {
                console.log("auth user try to access to public zone")
                return { path: "/managment" }
            }
            if (to.fullPath == '/logout') { 
                console.log("try to delete tokens")
                await ssoService.deleteRefreshToken()
                eventBus.emit(Event.logout)
                return { path: '/login' }
            }
            if (!isAdmin) {
                return { path: "/error" }
            }
        } else if (privateTarget) {
            return { path: '/login' };
        }
        return true
    }
);

export default router