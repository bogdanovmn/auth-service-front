import { createRouter, createWebHistory } from 'vue-router'

import RegistrationPage from '../components/RegistrationPage.vue'
import LoginPage from '../components/LoginPage.vue'
import ManagmentPage from './../components/ManagementPage.vue'
import ErrorPage from './../components/ErrorPage.vue'

import { tokenStorage, Role } from "@bogdanovmn/ssofw"
import { notificationStore } from "../stores/notifications"


const router = createRouter({
    history: createWebHistory('/sso/'),
    routes: [
        { path: "/error",        component: ErrorPage },
        { path: "/login",        component: LoginPage, meta: { onlyForUnauth: true } },
        { path: "/registration", component: RegistrationPage },
        { path: "/managment",    component: ManagmentPage, meta: { allow: Role.admin } },
        { path: "/logout",       component: LoginPage, meta: { private: true } },
        { path: "/:notFound",    component: ErrorPage },
        { path: "/",    component: ErrorPage }
    ]
})


router.beforeEach(
    async (to: any) => {
        const notifStore = notificationStore();

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

        if (to.meta.onlyForUnauth && isAuthenticated) {
            return error('Permission denied')
        }

        return true;

        function error(msg: string) {
            notifStore.setError(msg);
            console.log("set error msg = " + msg)
            return { path: "/error" }
        }
    }
);

export default router