<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { useRoute } from 'vue-router'
    import { SsoResourcesService, UserActivity } from '../common/sso-resources-service';
    import { t } from '../i18n'
    import AdminTabs from './AdminTabs.vue'


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

    function formatDate(value: string): string {
        const date = new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleString()
    }

    function formatShortDate(value: string): string {
        const date = new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
    }

    function typeLabel(type: string): string {
        switch (type) {
            case 'LOGIN': return t('activity.typeLogin')
            case 'SSO': return t('activity.typeSso')
            case 'LOGOUT': return t('activity.typeLogout')
            case 'REFRESH': return t('activity.typeRefresh')
            case 'PASSWORD_CHANGED': return t('activity.typePasswordChanged')
            case 'LOGIN_FAILED': return t('activity.typeLoginFailed')
            default: return type
        }
    }

    function typeClass(type: string): string {
        switch (type) {
            case 'LOGIN': return 'ev-login'
            case 'SSO': return 'ev-sso'
            case 'LOGOUT': return 'ev-logout'
            case 'REFRESH': return 'ev-refresh'
            case 'PASSWORD_CHANGED': return 'ev-password'
            case 'LOGIN_FAILED': return 'ev-failed'
            default: return 'ev-other'
        }
    }

    function display(value: string | null): string {
        return value && value.trim() !== '' ? value : t('activity.unknown')
    }
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

            <div v-else class="table-wrap">
                <table class="activity-table">
                    <thead>
                        <tr>
                            <th>{{ t('activity.type') }}</th>
                            <th>{{ t('activity.eventTime') }}</th>
                            <th>{{ t('activity.ip') }}</th>
                            <th>{{ t('activity.browser') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="event in data.events" :key="event.id">
                            <td class="cell-type" :data-label="t('activity.type')">
                                <span class="ev-badge" :class="typeClass(event.type)">
                                    {{ typeLabel(event.type) }}
                                </span>
                            </td>
                            <td class="cell-time" :data-label="t('activity.eventTime')">
                                <span class="date-full">{{ formatDate(event.createdAt) }}</span>
                                <span class="date-short">{{ formatShortDate(event.createdAt) }}</span>
                            </td>
                            <td class="cell-ip" :data-label="t('activity.ip')">{{ display(event.ip) }}</td>
                            <td class="cell-browser" :data-label="t('activity.browser')">{{ display(event.userAgent) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
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

.table-wrap {
    overflow-x: auto;
}

.activity-table {
    width: 100%;
    border-collapse: collapse;
}

.activity-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    background: rgba(102, 126, 234, 0.08);
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
}

.activity-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    color: #374151;
    font-size: 0.875rem;
}

.activity-table tbody tr {
    transition: background 0.2s ease;
}

.activity-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.04);
}

.cell-type {
    white-space: nowrap;
}

.cell-time {
    color: #6b7280;
    white-space: nowrap;
}

.cell-ip {
    color: #6b7280;
    white-space: nowrap;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.cell-browser {
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.date-short {
    display: none;
}

.ev-badge {
    display: inline-block;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
}

.ev-login {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.ev-sso {
    background: rgba(20, 184, 166, 0.12);
    color: #0f766e;
}

.ev-logout {
    background: rgba(107, 114, 128, 0.12);
    color: #4b5563;
}

.ev-refresh {
    background: rgba(59, 130, 246, 0.12);
    color: #1d4ed8;
}

.ev-password {
    background: rgba(168, 85, 247, 0.12);
    color: #7e22ce;
}

.ev-failed {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.ev-other {
    background: rgba(107, 114, 128, 0.12);
    color: #4b5563;
}

@media (max-width: 768px) {
    .table-wrap {
        overflow: visible;
    }

    .activity-table thead {
        display: none;
    }

    .activity-table,
    .activity-table tbody,
    .activity-table tr,
    .activity-table td {
        display: block;
    }

    .activity-table tbody tr {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.375rem 0.75rem;
        padding: 1rem;
        margin-bottom: 0.75rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        transition: all 0.2s ease;
    }

    .activity-table tbody tr:hover {
        background: #fff;
    }

    .activity-table td {
        padding: 0;
        border: none;
    }

    .activity-table td.cell-type {
        flex: 0 0 auto;
    }

    .cell-time {
        flex: 1 1 auto;
        font-size: 0.75rem;
    }

    .cell-ip,
    .cell-browser {
        flex: 1 1 100%;
        order: 3;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        max-width: none;
        overflow: visible;
        white-space: normal;
        word-break: break-all;
    }

    .cell-ip::before,
    .cell-browser::before {
        content: attr(data-label) ": ";
        color: #9ca3af;
    }

    .cell-ip {
        font-family: inherit;
    }

    .date-full {
        display: none;
    }

    .date-short {
        display: inline;
    }

    .ev-badge {
        padding: 0.1rem 0.45rem;
        font-size: 0.6rem;
    }
}
</style>