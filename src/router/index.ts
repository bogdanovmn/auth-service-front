import { inject } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import RegistrationPage from '../components/RegistrationPage.vue'
import LoginPage from '../components/LoginPage.vue'
import ManagmentPage from './../components/ManagementPage.vue'
import ErrorPage from './../components/ErrorPage.vue'

import { eventBus, Event } from '../common/event-bus'
import { SsoService, tokenStorage, Role } from "@bogdanovmn/ssofw"


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/error",        component: ErrorPage },
        { path: "/login",        component: LoginPage },
        { path: "/registration", component: RegistrationPage },
        { path: "/managment",    component: ManagmentPage, meta: { allow: Role.admin } },
        { path: "/logout",       component: LoginPage, meta: { private: true } },
        { path: "/:notFound",    component: ErrorPage },
        { path: "/",    component: ErrorPage }
    ]
})

function error(msg: string) {
    localStorage.setItem("errorMsg", msg)
    return { path: "/error" }
}

router.beforeEach(
    async (to: any) => {
        localStorage.removeItem("errorMsg")

        const ssoService = inject<SsoService>("ssoService")!
        const isAuthenticated = tokenStorage.defined()
        const isAdmin = tokenStorage.claims?.isSuperAdmin()
        const targetRole: Role = to.meta.allow
        const privateTarget = to.meta.private || targetRole

        console.log(`routing to ${to.fullPath} auth: ${isAuthenticated} isAdmin: ${isAdmin}`)

        if (targetRole && !tokenStorage.claims?.hasRole(targetRole, 'sso-service')) {
            return error('Permission denied')
        }

        if (privateTarget && !isAuthenticated) {
            return error('Permission denied')
        }

        return true
    }
);

export default router