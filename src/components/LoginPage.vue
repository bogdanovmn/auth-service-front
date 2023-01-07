<script setup lang="ts">
    import { ref, inject } from 'vue'
    import axios from 'axios';
    import router from '../router'
    import eventBus from '../common/event-bus'

    const http = inject("http")
    const authToken = inject("authToken")

    const email = ref("")
    const password = ref("")

    function loginRequest() {
        this.authToken.createNewJwtTokenByCredentials(this.email, this.password)
            .then((response: any) => eventBus.emit("loginSuccessEvent"))
    }

    // axios.interceptors.request.use(
    //     request => {
    //         console.log('Starting Request', JSON.stringify(request, null, 2))
    //         return request
    //     }
    // )

</script>

<template>
    <h1>Single page login</h1>

    <form v-on:submit.prevent>
        <div>
            Email
            <input type="text" placeholder="email" v-model="email" />
        </div>
        <div>
            Password
            <input type="password" autocomplete="false" placeholder="password" v-model="password" />
        </div>
        <div>
            <button @click="loginRequest()">login</button>
        </div>
    </form>

</template>

<style scoped>

</style>