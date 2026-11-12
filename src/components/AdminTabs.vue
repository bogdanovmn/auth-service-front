<script setup lang="ts">
    import { useRoute } from 'vue-router'
    import { t } from '../i18n'

    const route = useRoute()

    const tabs = [
        { to: '/managment', label: t('nav.applications'), icon: 'apps' },
        { to: '/users', label: t('nav.users'), icon: 'users' },
        { to: '/events', label: t('nav.allEvents'), icon: 'events' },
        { to: '/login-attempts', label: t('nav.loginAttempts'), icon: 'attempts' },
    ]

    function isActive(path: string): boolean {
        if (path === '/users') {
            return route.path === '/users' || route.path.startsWith('/users/')
        }
        return route.path === path
    }
</script>

<template>
    <nav class="admin-tabs" aria-label="Admin navigation">
        <router-link
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="admin-tab"
            :class="{ active: isActive(tab.to) }"
            :title="tab.label"
            :aria-label="tab.label"
        >
            <svg v-if="tab.icon === 'apps'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <svg v-else-if="tab.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <svg v-else-if="tab.icon === 'events'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span class="admin-tab-label">{{ tab.label }}</span>
        </router-link>
    </nav>
</template>

<style scoped>
.admin-tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    margin: 0 auto 2rem;
    max-width: 680px;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.12);
    border-radius: 12px;
}

.admin-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    padding: 0.6rem 1rem;
    border-radius: 9px;
    text-decoration: none;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.25s ease;
}

.admin-tab svg {
    flex: 0 0 auto;
}

.admin-tab-label {
    overflow: hidden;
    text-overflow: ellipsis;
}

.admin-tab:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.06);
}

.admin-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
    .admin-tabs {
        max-width: 340px;
    }

    .admin-tab {
        padding: 0.6rem 0.5rem;
    }

    .admin-tab-label {
        display: none;
    }
}
</style>
