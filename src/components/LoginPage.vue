<script setup lang="ts">
    import { inject, onMounted, ref, watch } from 'vue';
    import { eventBus, Event } from '../common/event-bus';
    import { SsoService } from "@bogdanovmn/ssofw"
    import { useRoute } from 'vue-router';
    import { authStore } from "../stores/auth"
    import router from '../router';
    import { t } from '../i18n';
    import { tooManyAttemptsMessage } from '../common/api-error';
    import { startOAuthLogin, oauthErrorMessage, redirectWithCode, storedReturnUrl, fetchEnabledProviders, OAuthProvider } from '../common/oauth';
    import { exchangeCredentialsToCode, exchangeJwtToCode } from '../common/sso';


    const auth = authStore()
    const ssoService = inject<SsoService>("ssoService")!

    const email = ref("")
    const password = ref("")
    const route = useRoute()
    const oauthProviders = ref<OAuthProvider[]>([])
    const oauthError = route.query.oauthError?.toString()
    auth.redirectToAfterSuccessLogin = route.query.from?.toString()
        ?? (oauthError ? storedReturnUrl() : null)
    const error = ref(oauthError ? oauthErrorMessage(oauthError) : "")
    // Keep the alert in the layout after the first error. Removing it shifts the
    // form under the cursor between mousedown and mouseup, which swallows clicks.
    const errorShown = ref(!!error.value)
    const lastError = ref(error.value)
    watch(error, value => {
        if (value) {
            errorShown.value = true
            lastError.value = value
        }
    })
    const isLoading = ref(false)

    function loginWithProvider(provider: OAuthProvider) {
        startOAuthLogin(provider, auth.redirectToAfterSuccessLogin)
    }

    onMounted(() => {
        fetchEnabledProviders().then(providers => {
            oauthProviders.value = providers
        })

        if (auth.redirectToAfterSuccessLogin && auth.isAuthenticated) {
            exchangeJwtToCode(auth.redirectToAfterSuccessLogin, null)
                .then(code => redirectWithCode(auth.redirectToAfterSuccessLogin!, code))
                .catch(() => router.push("/login"))
        }
    });

    function loginRequest() {
        error.value = ""
        isLoading.value = true

        if (auth.redirectToAfterSuccessLogin) {
            exchangeCredentialsToCode(email.value, password.value, auth.redirectToAfterSuccessLogin)
                .then(code => redirectWithCode(auth.redirectToAfterSuccessLogin!, code))
                .catch(err => {
                    handleLoginError(err)
                })
                .finally(() => {
                    isLoading.value = false
                })
        } else {
            ssoService.createNewTokenByCredentials(email.value, password.value)
                .then(() => eventBus.emit(Event.login))
                .catch(err => {
                    handleLoginError(err)
                })
                .finally(() => {
                    isLoading.value = false
                })
        }
    }

    function handleLoginError(err: any) {
        console.error('Login error:', err)
        
        if (err?.response?.status === 404) {
            error.value = t('login.userNotFound')
        } else if (err?.response?.status === 401) {
            error.value = t('login.invalidCredentials')
        } else if (err?.response?.status === 403) {
            error.value = t('login.accessDenied')
        } else if (err?.response?.status === 429) {
            error.value = tooManyAttemptsMessage(err)
        } else if (err?.response?.status >= 500) {
            error.value = t('login.serverError')
        } else if (err?.code === 'NETWORK_ERROR' || !navigator.onLine) {
            error.value = t('login.networkError')
        } else {
            error.value = t('login.failed')
        }
    }

    function clearError() {
        if (error.value) {
            error.value = ""
        }
    }

</script>

<template>
    <div class="container-xs">
        <div class="card">
            <div class="login-header">
                <div class="login-brand">
                    <div class="login-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10,17 15,12 10,7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                    </div>
                    <div class="login-title">
                        <h1>{{ t('login.welcome') }}</h1>
                        <p class="login-subtitle">{{ t('login.subtitle') }}</p>
                    </div>
                </div>
            </div>

            <div
                v-if="errorShown"
                class="alert alert-error"
                :class="{ 'alert-hidden': !error }"
                :aria-hidden="!error"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ lastError }}
            </div>

            <form @submit.prevent="loginRequest" class="login-form">
                <div class="form-group">
                    <label class="form-label" for="email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {{ t('login.emailLabel') }}
                    </label>
                    <input 
                        id="email"
                        type="email" 
                        class="form-input" 
                        :placeholder="t('login.emailPlaceholder')" 
                        v-model="email"
                        @input="clearError"
                        required
                        autocomplete="email"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        {{ t('login.passwordLabel') }}
                    </label>
                    <input 
                        id="password"
                        type="password" 
                        class="form-input" 
                        :placeholder="t('login.passwordPlaceholder')" 
                        v-model="password"
                        @input="clearError"
                        required
                        autocomplete="current-password"
                    />
                </div>

                <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
                    <div v-if="isLoading" class="loading"></div>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10,17 15,12 10,7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    {{ isLoading ? t('login.signingIn') : t('login.signIn') }}
                </button>
            </form>

            <div v-if="oauthProviders.length > 0" class="social-login">
                <div class="social-divider"><span>{{ t('login.socialDivider') }}</span></div>
                <div class="social-buttons">
                    <button
                        v-if="oauthProviders.includes('github')"
                        type="button"
                        class="btn btn-secondary social-btn"
                        @click="loginWithProvider('github')"
                    >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        {{ t('login.continueWithGithub') }}
                    </button>
                    <button
                        v-if="oauthProviders.includes('vk')"
                        type="button"
                        class="btn btn-secondary social-btn"
                        @click="loginWithProvider('vk')"
                    >
                        <span class="social-icon-vk" aria-hidden="true">VK</span>
                        {{ t('login.continueWithVk') }}
                    </button>
                    <button
                        v-if="oauthProviders.includes('yandex')"
                        type="button"
                        class="btn btn-secondary social-btn"
                        @click="loginWithProvider('yandex')"
                    >
                        <span class="social-icon-yandex" aria-hidden="true">Я</span>
                        {{ t('login.continueWithYandex') }}
                    </button>
                </div>
            </div>

            <div class="login-footer">
                <p>{{ t('login.noAccount') }} 
                    <router-link to="/registration" class="link">{{ t('login.createOne') }}</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-header {
    margin-bottom: 2rem;
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.login-icon {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
}

.login-icon svg {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 1rem;
    border-radius: 50%;
}

.login-title {
    text-align: left;
    min-width: 0;
}

.login-title h1 {
    margin-bottom: 0;
    text-align: left;
}

.login-subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-top: 0.25rem;
}

.login-form {
    margin-bottom: 2rem;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-label svg {
    color: #6b7280;
}

.login-btn {
    width: 100%;
    margin-top: 1rem;
}

.login-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.login-footer p {
    color: #6b7280;
    margin: 0;
}

/* External providers */
.social-login {
    margin-bottom: 2rem;
}

.social-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0 1rem;
    color: #9ca3af;
    font-size: 0.875rem;
}

.social-divider::before,
.social-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
}

.social-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.social-btn {
    width: 100%;
}

.social-icon-vk {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    font-weight: 800;
    font-size: 0.875rem;
    color: #0077ff;
}

.social-icon-yandex {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    font-weight: 800;
    font-size: 1rem;
    color: #fc3f1d;
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

.alert-hidden {
    visibility: hidden;
}

/* Loading state */
.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.login-btn:disabled:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

@media (max-width: 480px) {
    .login-header {
        margin-bottom: 1.5rem;
    }
    
    .login-brand {
        gap: 0.75rem;
    }
    
    .login-icon svg {
        width: 40px;
        height: 40px;
        padding: 0.75rem;
    }
    
    .login-subtitle {
        font-size: 0.875rem;
    }
}
</style>