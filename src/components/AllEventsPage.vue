<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { SsoResourcesService, SecurityEvent } from '../common/sso-resources-service';
    import { t } from '../i18n'
    import AdminTabs from './AdminTabs.vue'
    import SecurityEventsTable from './SecurityEventsTable.vue'


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!

    const data = ref<SecurityEvent[]>()
    const alert = ref("")

    ssoResourceService.allEvents()
        .then(events => data.value = events)
        .catch(err => {
            console.error('Load security events error:', err)
            data.value = []
            alert.value = t('allEvents.loadFailed')
        })
</script>

<template>
    <div class="container">
        <div class="card">
            <admin-tabs/>

            <div class="section-header">
                <h2>{{ t('allEvents.title') }}</h2>
                <p class="section-subtitle">{{ t('allEvents.subtitle') }}</p>
            </div>

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
                <p>{{ t('allEvents.loading') }}</p>
            </div>

            <div v-else-if="data.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <h3>{{ t('allEvents.emptyTitle') }}</h3>
                <p>{{ t('allEvents.emptyText') }}</p>
            </div>

            <security-events-table v-else :events="data" show-user/>
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
