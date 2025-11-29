<script setup lang="ts">
    import { inject, ref } from 'vue'
    import router from './router'
    import { eventBus, Event } from './common/event-bus'
    import { SsoService, tokenStorage } from "@bogdanovmn/ssofw"
    import AuthState from './components/AuthState.vue'
    import { notificationStore } from "./stores/notifications"
    import { authStore } from "./stores/auth"

    const notifStore = notificationStore();
    const auth = authStore()
    const ssoService = inject<SsoService>("ssoService")!

    auth.update()
    
    eventBus.on(Event.login, () => {
        auth.update()
        if (auth.isAdmin) {
            router.push('/managment')
        } else {
            notifStore.setError("Permission denied")
            router.push('/error')
        }
        router.push(auth.isAdmin ? "/managment" : "/error")
    });
    eventBus.on(Event.logout, async () => {
        console.log("try to delete tokens")
        await ssoService.deleteRefreshToken()
            .finally(() => {
                auth.update()
                router.push("/login");
            });
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
                    <template v-if="auth.userName">
                        <router-link to="/managment" v-if="auth.isAdmin" class="nav-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                            Management
                        </router-link>
                    </template>
                    <auth-state :user-name="auth.userName"/>
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