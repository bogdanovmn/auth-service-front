import { createRouter, createWebHistory } from 'vue-router'

import App from './../App.vue'
import RegistrationPage from '../components/RegistrationPage.vue'
import LoginPage from '../components/LoginPage.vue'
import PrivatePage from './../components/PrivatePage.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/login", component: LoginPage },
        { path: "/registration", component: RegistrationPage },
        { path: "/", component: PrivatePage }
    ]
})

export default router