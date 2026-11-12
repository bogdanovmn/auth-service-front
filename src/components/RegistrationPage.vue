<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { eventBus, Event } from '../common/event-bus'
import { SsoService } from "@bogdanovmn/ssofw"
import { authStore } from "../stores/auth"
import { t } from "../i18n"
import { tooManyAttemptsMessage } from "../common/api-error"
import { startOAuthLogin, OAuthProvider } from "../common/oauth"
import { exchangeCredentialsToCode } from "../common/sso"


const auth = authStore()
const ssoService = inject<SsoService>("ssoService")!
auth.redirectToAfterSuccessLogin = useRoute().query.from?.toString() ?? null

const name = ref("")
const email = ref("")
const password = ref("")
const passwordCheck = ref("")
const alert = ref("")
// Keep the alert in the layout after the first error. Removing it shifts the
// form under the cursor between mousedown and mouseup, which swallows clicks.
const alertShown = ref(false)
const lastAlert = ref("")
watch(alert, value => {
    if (value) {
        alertShown.value = true
        lastAlert.value = value
    }
})
const isLoading = ref(false)

function signupWithProvider(provider: OAuthProvider) {
    startOAuthLogin(provider, auth.redirectToAfterSuccessLogin)
}

function signupWithPassword() {
    alert.value = ""
    isLoading.value = true

    if (!name.value) {
        alert.value = t('registration.nameRequired')
        isLoading.value = false
    } else if (!email.value) {
        alert.value = t('registration.emailRequired')
        isLoading.value = false
    } else if (!password.value) {
        alert.value = t('registration.passwordRequired')
        isLoading.value = false
    } else if (password.value != passwordCheck.value) {
        alert.value = t('registration.passwordMismatch')
        isLoading.value = false
    } else {
        ssoService.createAccount({
            accountName: name.value,
            email: email.value,
            password: password.value
        }).then(
            () => {
                const tokenPromise = auth.redirectToAfterSuccessLogin
                    ? exchangeCredentialsToCode(email.value, password.value, auth.redirectToAfterSuccessLogin)
                        .then((code) => {
                            auth.codeToExchange = code
                            eventBus.emit(Event.login)
                        })
                    : ssoService.createNewTokenByCredentials(email.value, password.value)
                        .then(() => eventBus.emit(Event.login));
                tokenPromise.catch(err => {
                    handleRegistrationError(err)
                })
            }
        ).catch(err => {
            handleRegistrationError(err)
        }).finally(() => {
            isLoading.value = false
        })
    }
}

function handleRegistrationError(err: any) {
    console.error('Registration error:', err)
    
    if (err?.response?.status === 409) {
        alert.value = t('registration.emailExists')
    } else if (err?.response?.status === 400) {
        alert.value = t('registration.invalidData')
    } else if (err?.response?.status === 429) {
        alert.value = tooManyAttemptsMessage(err)
    } else if (err?.response?.status >= 500) {
        alert.value = t('registration.serverError')
    } else if (err?.code === 'NETWORK_ERROR' || !navigator.onLine) {
        alert.value = t('registration.networkError')
    } else {
        alert.value = t('registration.failed')
    }
}

function clearAlert() {
    if (alert.value) {
        alert.value = ""
    }
}

</script>

<template>
    <div class="container-xs">
        <div class="card">
            <div class="registration-header">
                <div class="registration-brand">
                    <div class="registration-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                    </div>
                    <div class="registration-title">
                        <h1>{{ t('registration.title') }}</h1>
                        <p class="registration-subtitle">{{ t('registration.subtitle') }}</p>
                    </div>
                </div>
            </div>

            <div
                v-if="alertShown"
                class="alert alert-error"
                :class="{ 'alert-hidden': !alert }"
                :aria-hidden="!alert"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ lastAlert }}
            </div>

            <form @submit.prevent="signupWithPassword" class="registration-form">
                <div class="form-group">
                    <label class="form-label" for="name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {{ t('registration.nameLabel') }}
                    </label>
                    <input 
                        id="name"
                        type="text" 
                        class="form-input" 
                        :placeholder="t('registration.namePlaceholder')" 
                        v-model="name"
                        @input="clearAlert"
                        required
                        autocomplete="name"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {{ t('registration.emailLabel') }}
                    </label>
                    <input 
                        id="email"
                        type="email" 
                        class="form-input" 
                        :placeholder="t('registration.emailPlaceholder')" 
                        v-model="email"
                        @input="clearAlert"
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
                        {{ t('registration.passwordLabel') }}
                    </label>
                    <input 
                        id="password"
                        type="password" 
                        class="form-input" 
                        :placeholder="t('registration.passwordPlaceholder')" 
                        v-model="password"
                        @input="clearAlert"
                        required
                        autocomplete="new-password"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="passwordCheck">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        {{ t('registration.confirmLabel') }}
                    </label>
                    <input 
                        id="passwordCheck"
                        type="password" 
                        class="form-input" 
                        :placeholder="t('registration.confirmPlaceholder')" 
                        v-model="passwordCheck"
                        @input="clearAlert"
                        required
                        autocomplete="new-password"
                    />
                </div>

                <button type="submit" class="btn btn-primary registration-btn" :disabled="isLoading">
                    <div v-if="isLoading" class="loading"></div>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    {{ isLoading ? t('registration.creatingAccount') : t('registration.createAccount') }}
                </button>
            </form>

            <div class="social-login">
                <div class="social-divider"><span>{{ t('registration.socialDivider') }}</span></div>
                <div class="social-buttons">
                    <button type="button" class="btn btn-secondary social-btn" @click="signupWithProvider('github')">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        {{ t('registration.continueWithGithub') }}
                    </button>
                    <button type="button" class="btn btn-secondary social-btn" @click="signupWithProvider('vk')">
                        <span class="social-icon-vk" aria-hidden="true">VK</span>
                        {{ t('registration.continueWithVk') }}
                    </button>
                </div>
            </div>

            <div class="registration-footer">
                <p>{{ t('registration.haveAccount') }} 
                    <router-link to="/login" class="link">{{ t('registration.signInHere') }}</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.registration-header {
    margin-bottom: 2rem;
}

.registration-brand {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.registration-icon {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
}

.registration-icon svg {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 1rem;
    border-radius: 50%;
}

.registration-title {
    text-align: left;
    min-width: 0;
}

.registration-title h1 {
    margin-bottom: 0;
    text-align: left;
}

.registration-subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-top: 0.25rem;
}

.registration-form {
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

.registration-btn {
    width: 100%;
    margin-top: 1rem;
}

.registration-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
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

.registration-footer p {
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

.alert-hidden {
    visibility: hidden;
}

/* Loading state */
.registration-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.registration-btn:disabled:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

@media (max-width: 480px) {
    .registration-header {
        margin-bottom: 1.5rem;
    }
    
    .registration-brand {
        gap: 0.75rem;
    }
    
    .registration-icon svg {
        width: 40px;
        height: 40px;
        padding: 0.75rem;
    }
    
    .registration-subtitle {
        font-size: 0.875rem;
    }
}
</style>