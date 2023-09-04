<script setup lang="ts">
    import { ref } from 'vue'
    import router from './router'
    import { eventBus, Event } from './common/event-bus'
    import { tokenStorage } from "@bogdanovmn/ssofw"


    const authenticated = ref(tokenStorage.defined())
    const isAdmin = ref(tokenStorage.claims?.isSuperAdmin())

    eventBus.on(Event.login, () => {
        authenticated.value = true
        isAdmin.value = tokenStorage.claims?.isSuperAdmin()
        router.push(isAdmin.value ? "/managment" : "/error")
    });
    eventBus.on(Event.logout, () => {
        authenticated.value = false
        router.push("/login")
    });
</script>

<template>
    <div id="#app">
        <template v-if="authenticated">
            <router-link to="/managment" v-if="isAdmin">Managment</router-link> ::
            <router-link to="/logout">Logout</router-link>
        </template>
        <template v-else>
            <router-link to="/login">Login</router-link> ::
            <router-link to="/registration">Registration</router-link>
        </template>
        <router-view></router-view>
    </div>
</template>

<style scoped>

</style>