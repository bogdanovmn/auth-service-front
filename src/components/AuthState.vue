<script setup lang="ts">
    import { eventBus, Event } from '../common/event-bus'
    import { t } from '../i18n'
    
    defineProps<{
        userName?: string | null
    }>()

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
                {{ t('auth.logout') }}
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

@media (max-width: 768px) {
    .auth-state {
        gap: 0.5rem;
    }
    
    .user-info {
        padding: 0.5rem 0.75rem;
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
