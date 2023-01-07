<script setup lang="ts">
    import { ref, inject } from 'vue'
    import router from './router'
    import './common/auth-request'
    import eventBus from './common/event-bus'

    
    const authenticated = ref(localStorage.token)

    eventBus.on("loginSuccessEvent", (event) => {
        authenticated.value = 'yes';
        router.push("/")
    });
    eventBus.on("logoutEvent", (event) => {
        authenticated.value = null;
        router.push("/login")
    });
</script>

<template>
    <div id="#app">
        <template v-if="authenticated">
            <router-link to="/">Private page</router-link> ::
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