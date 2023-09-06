<script setup lang="ts">
    import { inject, ref } from 'vue';
    import { eventBus, Event } from '../common/event-bus';
    import { SsoService } from "@bogdanovmn/ssofw"
    import { useRoute } from 'vue-router';


    const ssoService = inject<SsoService>("ssoService")!

    const email = ref("")
    const password = ref("")
    const from = useRoute().query.from

    function loginRequest() {
        if (from) {
            ssoService.exchangeCredentialsToCode(email.value, password.value)
                .then(
                    code => {
                        const redirectBackUrl = new URL(from.toString())
                        redirectBackUrl.searchParams.append('code', code)
                        window.location.href = redirectBackUrl.toString()
                    }
                )
        } else {
            ssoService.createNewTokenByCredentials(email.value, password.value)
                .then(() => eventBus.emit(Event.login))
        }
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