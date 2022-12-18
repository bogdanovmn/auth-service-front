<script setup lang="ts">
    import { ref } from 'vue'
    import './common/auth-request'

    const authenticated = ref(localStorage.token)

</script>

<template>
    <div id="#app">
        <router-link to="/login">Login</router-link> ::
        <router-link to="/registration">Registration</router-link> ::
        <router-link v-if="authenticated" to="/">Private page</router-link>
        <router-view></router-view>
    </div>
</template>

<style scoped>

</style>