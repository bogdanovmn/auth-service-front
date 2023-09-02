<script setup lang="ts">
    import { inject, ref } from 'vue';
    import eventBus from '../common/event-bus';
    import { SsoService } from "@bogdanovmn/ssofw"


    const ssoService = inject<SsoService>("ssoService")!

    const email = ref("")
    const password = ref("")

    function loginRequest() {
        ssoService.createNewTokenByCredentials(email.value, password.value)
            .then(() => eventBus.emit("loginSuccessEvent"))
    }

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