<script setup lang="ts">
import { ref, inject } from 'vue'
import { eventBus, Event } from '../common/event-bus'
import { SsoService } from "@bogdanovmn/ssofw"


const ssoService = inject<SsoService>("ssoService")!

const name = ref("")
const email = ref("")
const password = ref("")
const passwordCheck = ref("")
const alert = ref("")
const isLoading = ref(false)

function signupWithPassword() {
    alert.value = ""
    isLoading.value = true

    if (!name.value) {
        alert.value = "Name must be specified"
        isLoading.value = false
    } else if (!email.value) {
        alert.value = "Email must be specified"
        isLoading.value = false
    } else if (!password.value) {
        alert.value = "Password must be specified"
        isLoading.value = false
    } else if (password.value != passwordCheck.value) {
        alert.value = "Passwords must be matched"
        isLoading.value = false
    } else {
        ssoService.createAccount({
            accountName: name.value,
            email: email.value,
            password: password.value
        }).then(
            () => {
                ssoService.createNewTokenByCredentials(email.value, password.value)
                    .then(() => eventBus.emit(Event.login))
                    .catch(err => {
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
        alert.value = "An account with this email already exists."
    } else if (err?.response?.status === 400) {
        alert.value = "Invalid registration data. Please check your information."
    } else if (err?.response?.status >= 500) {
        alert.value = "Server error. Please try again later."
    } else if (err?.code === 'NETWORK_ERROR' || !navigator.onLine) {
        alert.value = "Network error. Please check your internet connection."
    } else {
        alert.value = "Registration failed. Please try again."
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
                <div class="registration-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                </div>
                <h1>Create Account</h1>
                <p class="registration-subtitle">Join us today and get started</p>
            </div>

            <div v-if="alert" class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ alert }}
            </div>

            <form @submit.prevent="signupWithPassword" class="registration-form">
                <div class="form-group">
                    <label class="form-label" for="name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Full Name
                    </label>
                    <input 
                        id="name"
                        type="text" 
                        class="form-input" 
                        placeholder="Enter your full name" 
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
                        Email Address
                    </label>
                    <input 
                        id="email"
                        type="email" 
                        class="form-input" 
                        placeholder="Enter your email" 
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
                        Password
                    </label>
                    <input 
                        id="password"
                        type="password" 
                        class="form-input" 
                        placeholder="Create a strong password" 
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
                        Confirm Password
                    </label>
                    <input 
                        id="passwordCheck"
                        type="password" 
                        class="form-input" 
                        placeholder="Confirm your password" 
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
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
            </form>

            <div class="registration-footer">
                <p>Already have an account? 
                    <router-link to="/login" class="link">Sign in here</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.registration-header {
    text-align: center;
    margin-bottom: 2rem;
}

.registration-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.registration-icon svg {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 1rem;
    border-radius: 50%;
}

.registration-subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-top: 0.5rem;
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