<script setup lang="ts">
    import { inject, ref } from 'vue'
    import router from './router'
    import { eventBus, Event } from './common/event-bus'
    import { SsoService, tokenStorage } from "@bogdanovmn/ssofw"
    import AuthState from './components/AuthState.vue'

    const ssoService = inject<SsoService>("ssoService")!
    const isAdmin = ref(tokenStorage.claims?.isSuperAdmin())
    const userName = ref(tokenStorage.claims?.userName)

    eventBus.on(Event.login, () => {
        userName.value = tokenStorage.claims?.userName
        isAdmin.value = tokenStorage.claims?.isSuperAdmin()
        console.log(`login as admin: ${isAdmin.value}`)
        router.push(isAdmin.value ? "/managment" : "/error")
    });
    eventBus.on(Event.logout, async () => {
        console.log("try to delete tokens")
        await ssoService.deleteRefreshToken()
        userName.value = undefined
        router.push("/login")
    });
</script>

<template>
    <div id="#app">
        <template v-if="userName">
            <router-link to="/managment" v-if="isAdmin">Managment</router-link>
        </template>
        <auth-state :user-name="userName"/>
        <router-view/>
    </div>
</template>

<style scoped>

</style>