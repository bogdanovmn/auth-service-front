<script setup lang="ts">
    import { useRouter } from 'vue-router'
    import { eventBus, Event } from '../common/event-bus'
    
    defineProps({
        userName: {
            type: String,
            default: null
        }
    })
    const router = useRouter()

    function gotToLogin() {
        router.push("/login")
    }

    function gotToRegistration() {
        router.push("/registration")
    }

    async function logout() {
        eventBus.emit(Event.logout)
    }
</script>

<template>
    <div v-if="userName">
        {{ userName }}
        <button @click="logout()">log out</button>
    </div>
    <div v-else>
        <button @click="gotToLogin()">log in</button>
        <button @click="gotToRegistration()">registration</button>
    </div>
</template>

<style scoped>
</style>
