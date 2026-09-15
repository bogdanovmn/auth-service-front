<script setup lang="ts">
    import { computed } from 'vue'
    import { eventBus, Event } from '../common/event-bus'
    import { t } from '../i18n'
    
    const props = defineProps<{
        userName?: string | null
    }>()

    const initials = computed(() => {
        if (!props.userName) return ''
        const parts = props.userName.trim().split(/\s+/).filter(Boolean)
        const first = parts[0]?.[0] ?? ''
        const second = parts[1]?.[0] ?? ''
        return (first + second).toUpperCase() || '?'
    })

    async function logout() {
        eventBus.emit(Event.logout)
    }
</script>

<template>
    <div class="auth-state">
        <div v-if="userName" class="user-info">
            <div class="user-avatar">{{ initials }}</div>
            <button
                @click="logout()"
                class="btn btn-sm btn-danger logout-btn"
                :title="t('auth.logout')"
                :aria-label="t('auth.logout')"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
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
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    flex-shrink: 0;
}

.logout-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    flex-shrink: 0;
}

@media (max-width: 768px) {
    .auth-state {
        gap: 0.5rem;
    }
}
</style>
