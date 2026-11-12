<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { useRoute } from 'vue-router'
    import { SsoResourcesService, UserActivity } from '../common/sso-resources-service';
    import { t } from '../i18n'
    import AdminTabs from './AdminTabs.vue'
    import SecurityEventsTable from './SecurityEventsTable.vue'


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!
    const route = useRoute()

    const userId = String(route.params.id)
    const data = ref<UserActivity>()
    const alert = ref("")

    ssoResourceService.userActivity(userId)
        .then(activity => data.value = activity)
        .catch(err => {
            console.error('Load user activity error:', err)
            alert.value = t('activity.loadFailed')
        })
</script>

<template>
    <div class="container">
        <div class="card">
            <admin-tabs/>

            <div class="section-header">
                <h2>{{ t('activity.title') }}</h2>
                <p v-if="data" class="section-subtitle">{{ t('activity.account') }}: {{ data.account.name }} · {{ data.account.email }}</p>
                <p v-else class="section-subtitle">{{ t('activity.subtitle') }}</p>
            </div>

            <router-link to="/users" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
                {{ t('activity.back') }}
            </router-link>

            <div v-if="alert" class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ alert }}
            </div>

            <div v-if="!data" class="loading-state">
                <div class="loading"></div>
                <p>{{ t('activity.loading') }}</p>
            </div>

            <div v-else-if="data.events.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <h3>{{ t('activity.emptyTitle') }}</h3>
                <p>{{ t('activity.emptyText') }}</p>
            </div>

            <security-events-table v-else :events="data.events"/>
        </div>
    </div>
</template>

<style scoped>
.section-header {
    margin-bottom: 1.5rem;
    text-align: center;
}

.section-subtitle {
    color: #6b7280;
    margin-top: 0.5rem;
    word-break: break-word;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: #667eea;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    margin-bottom: 1.25rem;
    transition: opacity 0.2s ease;
}

.back-link:hover {
    opacity: 0.8;
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
}

.loading-state p, .empty-state p {
    color: #6b7280;
    margin-top: 1rem;
}

.empty-state svg {
    color: #d1d5db;
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: #374151;
    margin-bottom: 0.5rem;
}
</style>
