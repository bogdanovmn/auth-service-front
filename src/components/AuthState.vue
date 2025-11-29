<script setup lang="ts">
    import { useRouter } from 'vue-router'
    import { eventBus, Event } from '../common/event-bus'
    
    defineProps<{
        userName?: string | null
    }>()
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
    <div class="auth-state">
        <div v-if="userName" class="user-info">
            <div class="user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <span class="user-name">{{ userName }}</span>
            <button @click="logout()" class="btn btn-sm btn-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
            </button>
        </div>
        <div v-else class="auth-buttons">
            <button @click="gotToLogin()" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
            </button>
            <button @click="gotToRegistration()" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Sign Up
            </button>
        </div>
    </div>
</template>

<style scoped>
.auth-state {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    color: white;
}

.user-name {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
}

.auth-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

@media (max-width: 768px) {
    .auth-state {
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }
    
    .user-info {
        flex-direction: column;
        text-align: center;
        width: 100%;
        padding: 1rem;
    }
    
    .auth-buttons {
        width: 100%;
        flex-direction: column;
    }
    
    .auth-buttons .btn {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .user-info {
        padding: 0.75rem;
    }
    
    .user-name {
        font-size: 0.8rem;
    }
}
</style>
