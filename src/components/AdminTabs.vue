<script setup lang="ts">
    import { useRoute } from 'vue-router'
    import { t } from '../i18n'

    const route = useRoute()

    const tabs = [
        { to: '/managment', label: t('nav.applications') },
        { to: '/users', label: t('nav.users') },
        { to: '/login-attempts', label: t('nav.loginAttempts') },
    ]
</script>

<template>
    <nav class="admin-tabs" aria-label="Admin navigation">
        <router-link
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="admin-tab"
            :class="{ active: route.path === tab.to }"
        >
            {{ tab.label }}
        </router-link>
    </nav>
</template>

<style scoped>
.admin-tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    margin: 0 auto 2rem;
    max-width: 420px;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.12);
    border-radius: 12px;
}

.admin-tab {
    flex: 1;
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

.admin-tab:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.06);
}

.admin-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
</style>