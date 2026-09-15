<script setup lang="ts">
    import { inject, onMounted, ref } from 'vue';
    import { eventBus, Event } from '../common/event-bus';
    import { SsoService } from "@bogdanovmn/ssofw"
    import { useRoute } from 'vue-router';
    import { authStore } from "../stores/auth"
    import router from '../router';
    import { t } from '../i18n';


    const auth = authStore()
    const ssoService = inject<SsoService>("ssoService")!

    const email = ref("")
    const password = ref("")
    auth.redirectToAfterSuccessLogin = useRoute().query.from?.toString() ?? null
    const error = ref("")
    const isLoading = ref(false)

    onMounted(() => {
        if (auth.redirectToAfterSuccessLogin && auth.isAuthenticated) {
            ssoService.exchangeJwtToCode()
                .then(redirectWithCode)
                .catch(() => router.push("/login"))
        }
    });

    function redirectWithCode(code: string) {
        const redirectBackUrl = new URL(auth.redirectToAfterSuccessLogin!)
        redirectBackUrl.searchParams.append('code', code)
        console.log(`redirectBackUrl: ${redirectBackUrl.toString()}`)
        window.location.href = redirectBackUrl.toString()
    }

    function loginRequest() {
        error.value = ""
        isLoading.value = true

        if (auth.redirectToAfterSuccessLogin) {
            ssoService.exchangeCredentialsToCode(email.value, password.value)
                .then(redirectWithCode)
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
                <div class="login-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10,17 15,12 10,7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                </div>
                <h1>{{ t('login.welcome') }}</h1>
                <p class="login-subtitle">{{ t('login.subtitle') }}</p>
            </div>

            <div v-if="error" class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ error }}
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
    text-align: center;
    margin-bottom: 2rem;
}

.login-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.login-icon svg {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 1rem;
    border-radius: 50%;
}

.login-subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-top: 0.5rem;
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