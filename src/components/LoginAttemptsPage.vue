<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { SsoResourcesService, LoginAttempt } from '../common/sso-resources-service';
    import { t } from '../i18n'
    import AdminTabs from './AdminTabs.vue'


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!

    const data = ref<LoginAttempt[]>()
    const alert = ref("")

    ssoResourceService.loginAttempts()
        .then(attempts => data.value = attempts)
        .catch(err => {
            console.error('Load login attempts error:', err)
            data.value = []
            alert.value = t('loginAttempts.loadFailed')
        })

    function formatDate(value: string): string {
        const date = new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleString()
    }

    function formatShortDate(value: string): string {
        const date = new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
    }

    function display(value: string | null): string {
        return value && value.trim() !== '' ? value : t('loginAttempts.unknown')
    }
</script>

<template>
    <div class="container">
        <div class="card">
            <admin-tabs/>

            <div class="section-header">
                <h2>{{ t('loginAttempts.title') }}</h2>
                <p class="section-subtitle">{{ t('loginAttempts.subtitle') }}</p>
            </div>

            <router-link to="/users" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
                {{ t('loginAttempts.back') }}
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
                <p>{{ t('loginAttempts.loading') }}</p>
            </div>

            <div v-else-if="data.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <h3>{{ t('loginAttempts.emptyTitle') }}</h3>
                <p>{{ t('loginAttempts.emptyText') }}</p>
            </div>

            <div v-else class="table-wrap">
                <table class="attempts-table">
                    <thead>
                        <tr>
                            <th>{{ t('loginAttempts.email') }}</th>
                            <th>{{ t('loginAttempts.when') }}</th>
                            <th>{{ t('loginAttempts.ip') }}</th>
                            <th>{{ t('loginAttempts.browser') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="attempt in data" :key="attempt.id">
                            <td class="cell-email" :data-label="t('loginAttempts.email')">
                                <span class="attempt-email">{{ attempt.email }}</span>
                                <span class="attempt-badge">{{ t('loginAttempts.badge') }}</span>
                            </td>
                            <td class="cell-time" :data-label="t('loginAttempts.when')">
                                <span class="date-full">{{ formatDate(attempt.createdAt) }}</span>
                                <span class="date-short">{{ formatShortDate(attempt.createdAt) }}</span>
                            </td>
                            <td class="cell-ip" :data-label="t('loginAttempts.ip')">{{ display(attempt.ip) }}</td>
                            <td class="cell-browser" :data-label="t('loginAttempts.browser')">{{ display(attempt.userAgent) }}</td>
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

.attempts-table {
    width: 100%;
    border-collapse: collapse;
}

.attempts-table th {
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

.attempts-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    color: #374151;
    font-size: 0.875rem;
}

.attempts-table tbody tr {
    transition: background 0.2s ease;
}

.attempts-table tbody tr:hover {
    background: rgba(239, 68, 68, 0.03);
}

.cell-email {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    white-space: nowrap;
}

.attempt-email {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
}

.attempt-badge {
    flex: 0 0 auto;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
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

@media (max-width: 768px) {
    .table-wrap {
        overflow: visible;
    }

    .attempts-table thead {
        display: none;
    }

    .attempts-table,
    .attempts-table tbody,
    .attempts-table tr,
    .attempts-table td {
        display: block;
    }

    .attempts-table tbody tr {
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

    .attempts-table tbody tr:hover {
        background: #fff;
    }

    .attempts-table td {
        padding: 0;
        border: none;
    }

    .attempts-table td.cell-email {
        display: flex;
        align-items: center;
        flex: 1 1 auto;
        gap: 0.5rem;
        order: 1;
    }

    .attempt-email,
    .attempt-badge {
        white-space: normal;
    }

    .cell-time {
        flex: 1 1 auto;
        order: 2;
        font-size: 0.75rem;
        text-align: right;
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

    .attempt-badge {
        padding: 0.1rem 0.45rem;
        font-size: 0.6rem;
    }
}
</style>