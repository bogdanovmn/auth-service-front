<script setup lang="ts">
    import { ref } from 'vue'
    import { SecurityEvent } from '../common/sso-resources-service'
    import { formatDateTime } from '../common/date-format'
    import { t } from '../i18n'

    defineProps<{
        events: SecurityEvent[]
        showUser?: boolean
    }>()

    const detailsEvent = ref<SecurityEvent | null>(null)

    function typeLabel(type: string): string {
        switch (type) {
            case 'LOGIN': return t('activity.typeLogin')
            case 'SSO': return t('activity.typeSso')
            case 'LOGOUT': return t('activity.typeLogout')
            case 'REFRESH': return t('activity.typeRefresh')
            case 'PASSWORD_CHANGED': return t('activity.typePasswordChanged')
            case 'LOGIN_FAILED': return t('activity.typeLoginFailed')
            case 'STATUS_CHANGED': return t('activity.typeStatusChanged')
            case 'OAUTH_LOGIN': return t('activity.typeOauthLogin')
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
            case 'STATUS_CHANGED': return 'ev-status'
            case 'OAUTH_LOGIN': return 'ev-sso'
            default: return 'ev-other'
        }
    }

    function display(value: string | null | undefined): string {
        return value && value.trim() !== '' ? value : t('activity.unknown')
    }

    function applicationName(value: string | null): string {
        if (!value || value.trim() === '') {
            return t('activity.unknown')
        }
        try {
            const url = new URL(value, window.location.origin)
            const segments = url.pathname.split('/').filter(segment => segment !== '')
            return segments.length > 0 ? segments[0] : t('activity.unknown')
        } catch {
            return value
        }
    }

    function authLabel(event: SecurityEvent): string {
        switch (event.provider) {
            case 'github': return 'GitHub'
            case 'vk': return 'VK'
            default: break
        }
        switch (event.type) {
            case 'LOGIN':
            case 'SSO': return t('activity.authPassword')
            case 'OAUTH_LOGIN': return t('activity.authOauth')
            default: return t('activity.notApplicable')
        }
    }

    function authApplicable(event: SecurityEvent): boolean {
        return authLabel(event) !== t('activity.notApplicable')
    }

    function closeDetails() {
        detailsEvent.value = null
    }
</script>

<template>
    <div>
        <div class="table-wrap">
            <table class="events-table">
                <thead>
                    <tr>
                        <th>{{ t('activity.type') }}</th>
                        <th v-if="showUser">{{ t('activity.user') }}</th>
                        <th>{{ t('activity.ip') }}</th>
                        <th class="details-col">{{ t('activity.details') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="event in events" :key="event.id">
                        <td class="cell-event" :data-label="t('activity.type')">
                            <div class="event-date">{{ formatDateTime(event.createdAt) }}</div>
                            <div class="event-badges">
                                <span class="ev-badge" :class="typeClass(event.type)">
                                    {{ typeLabel(event.type) }}
                                </span>
                                <span
                                    v-if="event.clientUrl"
                                    class="meta-badge"
                                    :title="event.clientUrl"
                                >{{ applicationName(event.clientUrl) }}</span>
                                <span v-if="authApplicable(event)" class="meta-badge">{{ authLabel(event) }}</span>
                            </div>
                        </td>
                        <td v-if="showUser" class="cell-user" :data-label="t('activity.user')">
                            <router-link
                                v-if="event.accountId"
                                :to="`/users/${event.accountId}/activity`"
                                class="user-link"
                                :title="event.accountEmail"
                            >{{ display(event.accountEmail) }}</router-link>
                            <span v-else>{{ display(event.accountEmail) }}</span>
                        </td>
                        <td class="cell-ip" :data-label="t('activity.ip')">{{ display(event.ip) }}</td>
                        <td class="cell-details">
                            <button
                                class="icon-btn"
                                :title="t('activity.details')"
                                :aria-label="t('activity.details')"
                                @click="detailsEvent = event"
                            >
                                <span class="info-glyph" aria-hidden="true">i</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Teleport to="body">
            <div v-if="detailsEvent" class="modal-overlay" @click.self="closeDetails">
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-icon">
                            <span class="info-glyph info-glyph-lg" aria-hidden="true">i</span>
                        </div>
                        <h3>{{ t('activity.detailsTitle') }}</h3>
                        <p class="modal-subtitle">{{ typeLabel(detailsEvent.type) }} · {{ formatDateTime(detailsEvent.createdAt) }}</p>
                    </div>

                    <dl class="details-list">
                        <div class="details-row">
                            <dt>{{ t('activity.browser') }}</dt>
                            <dd>{{ display(detailsEvent.userAgent) }}</dd>
                        </div>
                        <div class="details-row">
                            <dt>{{ t('activity.ip') }}</dt>
                            <dd>{{ display(detailsEvent.ip) }}</dd>
                        </div>
                        <div class="details-row">
                            <dt>{{ t('activity.applicationUrl') }}</dt>
                            <dd>{{ display(detailsEvent.clientUrl) }}</dd>
                        </div>
                    </dl>

                    <div class="modal-actions">
                        <button class="btn btn-secondary btn-sm" @click="closeDetails">{{ t('activity.close') }}</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.table-wrap {
    overflow-x: auto;
}

.events-table {
    width: 100%;
    border-collapse: collapse;
}

.events-table th {
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

.events-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    color: #374151;
    font-size: 0.875rem;
}

.events-table tbody tr {
    transition: background 0.2s ease;
}

.events-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.04);
}

.cell-event {
    min-width: 220px;
}

.event-date {
    color: #6b7280;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.event-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.35rem;
}

.cell-user {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-link {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
}

.user-link:hover {
    text-decoration: underline;
}

.cell-ip {
    color: #6b7280;
    white-space: nowrap;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.details-col,
.cell-details {
    text-align: center;
    width: 1%;
    white-space: nowrap;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    cursor: pointer;
    transition: all 0.2s ease;
}

.icon-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-1px);
}

.info-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
}

.info-glyph-lg {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-size: 28px;
}

.ev-badge,
.meta-badge {
    display: inline-block;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
}

.meta-badge {
    background: rgba(102, 126, 234, 0.08);
    color: #4b5563;
    border: 1px solid rgba(102, 126, 234, 0.16);
    font-weight: 500;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
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

.ev-status {
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
}

.ev-other {
    background: rgba(107, 114, 128, 0.12);
    color: #4b5563;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 50;
}

.modal {
    background: white;
    border-radius: 16px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    max-width: 560px;
    width: 100%;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    animation: slideDown 0.3s ease-out;
}

.modal-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.modal-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.modal-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.details-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.details-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    background: rgba(102, 126, 234, 0.06);
    border: 1px solid rgba(102, 126, 234, 0.16);
    border-radius: 12px;
}

.details-row dt {
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.details-row dd {
    color: #374151;
    font-size: 0.875rem;
    word-break: break-word;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

@media (max-width: 768px) {
    .table-wrap {
        overflow: visible;
    }

    .events-table thead {
        display: none;
    }

    .events-table,
    .events-table tbody,
    .events-table tr,
    .events-table td {
        display: block;
    }

    .events-table tbody tr {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.375rem 0.75rem;
        padding: 1rem;
        margin-bottom: 0.75rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
    }

    .events-table tbody tr:hover {
        background: #fff;
    }

    .events-table td {
        padding: 0;
        border: none;
    }

    .cell-event {
        flex: 1 1 auto;
        order: 1;
        min-width: 0;
        font-size: 0.75rem;
    }

    .event-date {
        font-size: 0.75rem;
    }

    .event-badges {
        margin-top: 0.25rem;
    }

    .cell-details {
        flex: 0 0 auto;
        order: 2;
        margin-left: auto;
    }

    .cell-user {
        flex: 1 1 100%;
        order: 3;
        max-width: none;
        font-size: 0.8rem;
    }

    .cell-user::before {
        content: attr(data-label) ": ";
        color: #9ca3af;
    }

    .cell-ip {
        flex: 1 1 100%;
        order: 4;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        max-width: none;
        overflow: visible;
        white-space: normal;
        word-break: break-all;
        font-family: inherit;
    }

    .cell-ip::before {
        content: attr(data-label) ": ";
        color: #9ca3af;
    }

    .ev-badge,
    .meta-badge {
        padding: 0.1rem 0.45rem;
        font-size: 0.6rem;
    }

    .modal {
        padding: 1.5rem;
    }
}
</style>
