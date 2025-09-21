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
    <div id="app">
        <!-- Navigation -->
        <nav class="nav">
            <div class="nav-content">
                <div class="nav-brand">
                    <h3>Auth Service</h3>
                </div>
                <div class="nav-links">
                    <template v-if="userName">
                        <router-link to="/managment" v-if="isAdmin" class="nav-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                            Management
                        </router-link>
                    </template>
                    <auth-state :user-name="userName"/>
                </div>
            </div>
        </nav>

        <!-- Main content -->
        <main class="main-content">
            <router-view/>
        </main>
    </div>
</template>

<style scoped>
.nav-brand h3 {
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.5rem;
    font-weight: 700;
}

.main-content {
    flex: 1;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    .main-content {
        padding: 1rem 0;
    }
    
    .nav-brand h3 {
        font-size: 1.25rem;
    }
}
</style>