<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { useRoute } from 'vue-router'
    import { tokenStorage } from "@bogdanovmn/ssofw"
    import router from '../router'
    import { SsoResourcesService } from '../common/sso-resources-service';
    import { authStore } from "../stores/auth"
    import { t } from "../i18n"


    const auth = authStore()
    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!

    const token = ref(useRoute().query.token?.toString() ?? "")
    const password = ref("")
    const passwordCheck = ref("")
    const alert = ref("")
    const isLoading = ref(false)
    const isSuccess = ref(false)

    function changePassword() {
        alert.value = ""
        isLoading.value = true

        if (!token.value) {
            alert.value = t('passwordReset.linkExpired')
            isLoading.value = false
        } else if (!password.value) {
            alert.value = t('passwordReset.passwordRequired')
            isLoading.value = false
        } else if (password.value != passwordCheck.value) {
            alert.value = t('passwordReset.passwordMismatch')
            isLoading.value = false
        } else {
            ssoResourceService.changePasswordByResetToken(token.value, password.value)
                .then(() => {
                    tokenStorage.clear()
                    auth.update()
                    isSuccess.value = true
                })
                .catch(err => {
                    handleResetError(err)
                })
                .finally(() => {
                    isLoading.value = false
                })
        }
    }

    function handleResetError(err: any) {
        console.error('Password reset error:', err)

        if (err?.response?.status === 400 || err?.response?.status === 404) {
            alert.value = t('passwordReset.linkExpired')
        } else if (err?.response?.status >= 500) {
            alert.value = t('passwordReset.serverError')
        } else if (err?.code === 'NETWORK_ERROR' || !navigator.onLine) {
            alert.value = t('passwordReset.networkError')
        } else {
            alert.value = t('passwordReset.failed')
        }
    }

    function clearAlert() {
        if (alert.value) {
            alert.value = ""
        }
    }

    function goToLogin() {
        router.push('/login')
    }
</script>

<template>
    <div class="container-xs">
        <div class="card">
            <div v-if="!token" class="reset-state">
                <div class="reset-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1>{{ t('passwordReset.invalidTokenTitle') }}</h1>
                <p class="reset-subtitle">{{ t('passwordReset.invalidTokenText') }}</p>
                <button class="btn btn-primary" @click="goToLogin">{{ t('passwordReset.goToLogin') }}</button>
            </div>

            <div v-else-if="isSuccess" class="reset-state">
                <div class="success-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <h1>{{ t('passwordReset.success') }}</h1>
                <p class="reset-subtitle">{{ t('passwordReset.successNote') }}</p>
                <button class="btn btn-primary" @click="goToLogin">{{ t('passwordReset.goToLogin') }}</button>
            </div>

            <div v-else>
                <div class="reset-header">
                    <div class="reset-brand">
                        <div class="reset-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="reset-title">
                            <h1>{{ t('passwordReset.title') }}</h1>
                            <p class="reset-subtitle">{{ t('passwordReset.subtitle') }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="alert" class="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {{ alert }}
                </div>

                <form @submit.prevent="changePassword" class="reset-form">
                    <div class="form-group">
                        <label class="form-label" for="password">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            {{ t('passwordReset.passwordLabel') }}
                        </label>
                        <input
                            id="password"
                            type="password"
                            class="form-input"
                            :placeholder="t('passwordReset.passwordPlaceholder')"
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
                            {{ t('passwordReset.confirmLabel') }}
                        </label>
                        <input
                            id="passwordCheck"
                            type="password"
                            class="form-input"
                            :placeholder="t('passwordReset.confirmPlaceholder')"
                            v-model="passwordCheck"
                            @input="clearAlert"
                            required
                            autocomplete="new-password"
                        />
                    </div>

                    <button type="submit" class="btn btn-primary reset-btn" :disabled="isLoading">
                        <div v-if="isLoading" class="loading"></div>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        {{ isLoading ? t('passwordReset.submitting') : t('passwordReset.submit') }}
                    </button>
                </form>

                <div class="reset-footer">
                    <p>{{ t('passwordReset.expiredHint') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.reset-header {
    margin-bottom: 2rem;
}

.reset-brand {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.reset-icon {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 1rem;
    border-radius: 50%;
}

.success-icon {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
    padding: 1rem;
    border-radius: 50%;
    margin-bottom: 1rem;
}

.reset-title {
    text-align: left;
    min-width: 0;
}

.reset-title h1 {
    margin-bottom: 0;
    text-align: left;
}

.reset-subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-top: 0.25rem;
}

.reset-form {
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

.reset-btn {
    width: 100%;
    margin-top: 1rem;
}

.reset-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.reset-footer p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
}

.reset-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    text-align: center;
    gap: 1rem;
}

.reset-state h1 {
    margin-bottom: 0;
}

.reset-state .btn {
    margin-top: 1rem;
}

.reset-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.reset-btn:disabled:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

@media (max-width: 480px) {
    .reset-header {
        margin-bottom: 1.5rem;
    }
    
    .reset-brand {
        gap: 0.75rem;
    }
    
    .reset-icon, .success-icon {
        width: 40px;
        height: 40px;
        padding: 0.75rem;
    }
    
    .reset-subtitle {
        font-size: 0.875rem;
    }
}
</style>