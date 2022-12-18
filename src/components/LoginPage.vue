<script setup lang="ts">
    import { ref, inject } from 'vue'
    import axios from 'axios';

    const email = ref("")
    const password = ref("")

    const token = ref(localStorage.getItem("token"))
    const http = inject("http")

    async function loginRequest() {
        this.http.createToken(this.email, this.password)
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