<script setup lang="ts">
    import { inject, onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import { SsoService } from '@bogdanovmn/ssofw'
    import { eventBus, Event } from '../common/event-bus'
    import { redirectWithCode, takeOAuthProvider, takeReturnUrl } from '../common/oauth'
    import { exchangeJwtToCode } from '../common/sso'
    import { t } from '../i18n'

    const ssoService = inject<SsoService>("ssoService")!
    const route = useRoute()

    const error = ref("")
    const isLoading = ref(true)

    onMounted(() => {
        const code = route.query.code?.toString()
        if (!code) {
            isLoading.value = false
            error.value = t('oauthCallback.missingCode')
            return
        }

        ssoService.exchangeCodeToJwt(code)
            .then(() => {
                const provider = takeOAuthProvider()
                const returnUrl = takeReturnUrl()
                if (!returnUrl) {
                    eventBus.emit(Event.login)
                    return
                }
                return exchangeJwtToCode(returnUrl, provider)
                    .then(temporaryCode => redirectWithCode(returnUrl, temporaryCode))
            })
            .catch(() => {
                isLoading.value = false
                error.value = t('oauthCallback.failed')
            })
    })
</script>

<template>
    <div class="container-xs">
        <div class="card oauth-callback">
            <div v-if="isLoading" class="oauth-callback-state">
                <div class="loading"></div>
                <p>{{ t('oauthCallback.processing') }}</p>
            </div>

            <div v-else class="oauth-callback-state">
                <div class="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {{ error }}
                </div>
                <router-link to="/login" class="link">{{ t('oauthCallback.backToLogin') }}</router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.oauth-callback {
    text-align: center;
}

.oauth-callback-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem 0;
}

.oauth-callback-state p {
    color: #6b7280;
    margin: 0;
}

.link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.link:hover {
    color: #5a67d8;
    text-decoration: underline;
}
</style>
