<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { useRouter } from 'vue-router'
    import { SsoResourcesService, UserRecord, PasswordResetLink } from '../common/sso-resources-service';
    import { t } from '../i18n'
    import AdminTabs from './AdminTabs.vue'


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!
    const router = useRouter()

    const data = ref<UserRecord[]>()
    const alert = ref("")
    const creatingFor = ref<string | null>(null)
    const linkModal = ref<{ link: string, expiresAt: string } | null>(null)
    const linkCopied = ref(false)

    ssoResourceService.users()
        .then(users => data.value = users)
        .catch(err => {
            console.error('Load users error:', err)
            data.value = []
            alert.value = t('users.loadFailed')
        })

    function generateLink(user: UserRecord) {
        alert.value = ""
        creatingFor.value = user.id
        ssoResourceService.createPasswordResetLink(user.id)
            .then((result: PasswordResetLink) => {
                linkModal.value = {
                    link: buildResetLink(result.token),
                    expiresAt: result.expiresAt
                }
                linkCopied.value = false
            })
            .catch(err => {
                console.error('Create password reset link error:', err)
                alert.value = t('users.linkCreateFailed')
            })
            .finally(() => {
                creatingFor.value = null
            })
    }

    function buildResetLink(token: string): string {
        return `${window.location.origin}/sso/password-reset?token=${token}`
    }

    function openActivity(user: UserRecord) {
        router.push(`/users/${user.id}/activity`)
    }

    async function copyLink() {
        if (!linkModal.value) return
        try {
            await navigator.clipboard.writeText(linkModal.value.link)
            linkCopied.value = true
            setTimeout(() => (linkCopied.value = false), 2000)
        } catch (err) {
            console.error('Copy link error:', err)
        }
    }

    function closeModal() {
        linkModal.value = null
    }

    function formatDate(value: string): string {
        const date = new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleString()
    }

    function formatShortDate(value: string): string {
        const date = new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
    }

    function statusLabel(status: string): string {
        if (status === 'ACTIVE') return t('users.statusActive')
        if (status === 'INACTIVE') return t('users.statusInactive')
        return t('users.statusCreated')
    }

    function statusClass(status: string): string {
        if (status === 'ACTIVE') return 'status-active'
        if (status === 'INACTIVE') return 'status-inactive'
        return 'status-created'
    }
</script>

<template>
    <div class="container">
        <div class="card">
            <admin-tabs/>

            <div class="section-header">
                <h2>{{ t('users.title') }}</h2>
                <p class="section-subtitle">{{ t('users.subtitle') }}</p>
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
                <p>{{ t('users.loading') }}</p>
            </div>

            <div v-else-if="data.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h3>{{ t('users.noUsersTitle') }}</h3>
                <p>{{ t('users.noUsersText') }}</p>
            </div>

            <div v-else class="table-wrap">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>{{ t('users.name') }}</th>
                            <th>{{ t('users.email') }}</th>
                            <th>{{ t('users.createdAt') }}</th>
                            <th>{{ t('users.updatedAt') }}</th>
                            <th class="actions-col">{{ t('users.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in data" :key="user.id">
                            <td class="cell-name">
                                <span class="user-name">{{ user.name }}</span>
                                <span class="status-badge" :class="statusClass(user.status)" :title="statusLabel(user.status)">
                                    {{ statusLabel(user.status) }}
                                </span>
                            </td>
                            <td class="cell-email">
                                <span class="user-email">{{ user.email }}</span>
                            </td>
                            <td class="cell-created" :data-label="t('users.createdAt')">
                                <span class="date-full">{{ formatDate(user.createdAt) }}</span>
                                <span class="date-short">{{ formatShortDate(user.createdAt) }}</span>
                            </td>
                            <td class="cell-updated" :data-label="t('users.updatedAt')">
                                <span class="date-full">{{ formatDate(user.updatedAt) }}</span>
                                <span class="date-short">{{ formatShortDate(user.updatedAt) }}</span>
                            </td>
                            <td class="cell-actions">
                                <button
                                    class="icon-btn"
                                    :title="t('users.activity')"
                                    :aria-label="t('users.activity')"
                                    @click="openActivity(user)"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                    </svg>
                                </button>
                                <button
                                    class="icon-btn"
                                    :title="t('users.generateLink')"
                                    :aria-label="t('users.generateLink')"
                                    :disabled="creatingFor === user.id"
                                    @click="generateLink(user)"
                                >
                                    <div v-if="creatingFor === user.id" class="icon-loading"></div>
                                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <circle cx="12" cy="16" r="1"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="linkModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h3>{{ t('users.linkModalTitle') }}</h3>
                    <p class="modal-subtitle">{{ t('users.linkModalText') }}</p>
                </div>

                <div class="link-box">
                    <span class="link-value">{{ linkModal.link }}</span>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-primary btn-sm" @click="copyLink">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        {{ linkCopied ? t('users.linkCopied') : t('users.copyLink') }}
                    </button>
                    <button class="btn btn-secondary btn-sm" @click="closeModal">{{ t('users.close') }}</button>
                </div>

                <p class="link-expiry">{{ t('users.linkExpires', { expires: formatDate(linkModal.expiresAt) }) }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.section-header {
    margin-bottom: 2rem;
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

.table-wrap {
    overflow-x: auto;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
}

.users-table th {
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

.users-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    color: #374151;
}

.users-table tbody tr {
    transition: background 0.2s ease;
}

.users-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.04);
}

.cell-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
}

.user-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
}

.user-email {
    display: block;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #6b7280;
}

.user-date,
.cell-created,
.cell-updated {
    color: #6b7280;
    white-space: nowrap;
    font-size: 0.875rem;
}

.date-short {
    display: none;
}

.actions-col,
.cell-actions {
    text-align: center;
    white-space: nowrap;
    width: 1%;
}

.cell-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.status-badge {
    display: inline-block;
    flex: 0 0 auto;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
}

.status-active {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.status-inactive {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.status-created {
    background: rgba(107, 114, 128, 0.12);
    color: #4b5563;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 10px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    cursor: pointer;
    transition: all 0.2s ease;
}

.icon-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-1px);
}

.icon-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.icon-loading {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(102, 126, 234, 0.3);
    border-radius: 50%;
    border-top-color: #667eea;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
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

.modal-icon svg {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 0.75rem;
    border-radius: 50%;
}

.modal-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.link-box {
    padding: 1rem;
    background: rgba(102, 126, 234, 0.06);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    margin-bottom: 1.25rem;
}

.link-value {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85rem;
    color: #374151;
    word-break: break-all;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.link-expiry {
    text-align: center;
    color: #6b7280;
    font-size: 0.8rem;
    margin: 1.25rem 0 0 0;
}

@media (max-width: 480px) {
    .modal {
        padding: 1.5rem;
    }
}

@media (max-width: 768px) {
    .table-wrap {
        overflow: visible;
    }

    .users-table thead {
        display: none;
    }

    .users-table,
    .users-table tbody,
    .users-table tr,
    .users-table td {
        display: block;
    }

    .users-table tbody tr {
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

    .users-table tbody tr:hover {
        background: #fff;
    }

    .users-table td {
        padding: 0;
        border: none;
    }

    .users-table td.cell-name {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1 1 auto;
        min-width: 0;
        order: 1;
    }

    .cell-actions {
        flex: 0 0 auto;
        width: auto;
        order: 2;
        margin-left: auto;
    }

    .users-table td.cell-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.375rem;
    }

    .status-badge {
        flex: 0 0 auto;
        padding: 0.05rem 0.45rem;
        font-size: 0.5rem;
        line-height: 1.5;
    }

    .cell-actions .icon-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
    }

    .cell-actions .icon-btn svg {
        width: 14px;
        height: 14px;
    }

    .cell-actions .icon-loading {
        width: 12px;
        height: 12px;
        border-width: 2px;
    }

    .user-name,
    .user-email {
        max-width: none;
    }

    .cell-email {
        flex: 1 1 100%;
        order: 4;
        margin-top: 0.25rem;
    }

    .user-email {
        font-size: 0.85rem;
    }

    .cell-created,
    .cell-updated {
        flex: 0 0 auto;
        order: 5;
        font-size: 0.75rem;
    }

    .cell-created {
        margin-right: 0.75rem;
    }

    .cell-created::before {
        content: attr(data-label) ": ";
        color: #9ca3af;
    }

    .cell-updated::before {
        content: attr(data-label) ": ";
        color: #9ca3af;
    }

    .date-full {
        display: none;
    }

    .date-short {
        display: inline;
    }
}
</style>