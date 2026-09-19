<script setup lang="ts">
    import { inject, ref } from 'vue'
    import router from './router'
    import { eventBus, Event } from './common/event-bus'
    import { SsoService, tokenStorage } from "@bogdanovmn/ssofw"
    import AuthState from './components/AuthState.vue'
    import LocaleSwitcher from './components/LocaleSwitcher.vue'
    import { authStore } from "./stores/auth"
    import { t } from './i18n'

    const auth = authStore()
    const ssoService = inject<SsoService>("ssoService")!

    auth.update()
    
    eventBus.on(Event.login, () => {
        auth.update()
        if (auth.redirectToAfterSuccessLogin) {
            const redirectBackUrl = new URL(auth.redirectToAfterSuccessLogin!)
            redirectBackUrl.searchParams.append('code', auth.codeToExchange!)
            console.log(`redirectBackUrl: ${redirectBackUrl.toString()}`)
            window.location.href = redirectBackUrl.toString()
        } else {
            if (auth.isAdmin) {
                router.push('/managment')
            } else {
                router.push('/lost')
            }
        }
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
                    <h3>{{ t('nav.brand') }}</h3>
                </div>
                <div class="nav-links">
                    <locale-switcher/>
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