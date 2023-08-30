<script setup lang="ts">
import { ref, inject } from 'vue'
import axios from 'axios';
import eventBus from '../common/event-bus'
import { AuthToken } from '../common/auth-token';

const authToken = inject<AuthToken>("authToken")!

const name = ref("")
const email = ref("")
const password = ref("")
const passwordCheck = ref("")
const alert = ref("")

function signupWithPassword() {
    if (!name.value) {
        alert.value = "Name must be specified"
    } else if (!email.value) {
        alert.value = "Email must be specified"
    } else if (!password.value) {
        alert.value = "Password must be specified"
    } else if (password.value != passwordCheck.value) {
        alert.value = "Passwords must be matched"
    } else {
        axios.post("http://localhost:8091/accounts", {
            accountName: name.value,
            email: email.value,
            password: password.value
        }).then(
            () => {
                authToken.createNewJwtTokenByCredentials(email.value, password.value)
                    .then(() => eventBus.emit("loginSuccessEvent"))
        })
    }
}

</script>

<template>
	<h1>Registration of a new account</h1>

    <div>
        <div id="alert" v-if="alert">{{ alert }}</div>
        <form>
            <div>
                Name
                <input type="text" placeholder="name" v-model="name" />
            </div>
            <div>
                Email
                <input type="text" placeholder="email" v-model="email" />
            </div>
            <div>
                Password
                <input type="password" autocomplete="false" placeholder="password" v-model="password" />
            </div>
            <div>
                Password checking
                <input type="password" autocomplete="false" placeholder="password" v-model="passwordCheck" />
            </div>
            <div>
                <button type="submit" form="creds" @click="signupWithPassword()">Sign up</button>
            </div>
        </form>
    </div>
</template>

<style scoped>
</style>