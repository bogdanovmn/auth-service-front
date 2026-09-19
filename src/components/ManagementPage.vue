<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { ApplictionsOverview, SsoResourcesService } from '../common/sso-resources-service';
    import { t } from '../i18n'
    import AdminTabs from './AdminTabs.vue'


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!

    type EditForm = {
        id: number
        name: string
        shortDescription: string
        url: string
    }

    const data = ref<ApplictionsOverview[]>()
    const alert = ref("")
    const editModal = ref<EditForm | null>(null)
    const isSaving = ref(false)

    load()

    function load() {
        ssoResourceService.applicationsOverview()
            .then(overview => data.value = overview)
            .catch(err => {
                console.error('Load applications error:', err)
                data.value = []
                alert.value = t('management.loadFailed')
            })
    }

    function openEdit(app: ApplictionsOverview) {
        alert.value = ""
        editModal.value = {
            id: app.id,
            name: app.name,
            shortDescription: app.shortDescription ?? '',
            url: app.url ?? ''
        }
    }

    function closeEdit() {
        editModal.value = null
    }

    function saveEdit() {
        if (!editModal.value) return
        isSaving.value = true
        alert.value = ""
        ssoResourceService.updateApplication(editModal.value.id, {
            name: editModal.value.name.trim(),
            shortDescription: editModal.value.shortDescription.trim() || null,
            url: editModal.value.url.trim() || null
        })
            .then(() => {
                closeEdit()
                load()
            })
            .catch(err => {
                console.error('Update application error:', err)
                alert.value = t('management.updateFailed')
            })
            .finally(() => {
                isSaving.value = false
            })
    }
</script>

<template>
    <div class="container">
        <div class="card">
            <admin-tabs/>

            <div class="section-header">
                <h2>{{ t('management.appsOverview') }}</h2>
                <p class="section-subtitle">{{ t('management.subtitle') }}</p>
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
                <p>{{ t('management.loading') }}</p>
            </div>

            <div v-else-if="data.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
                <h3>{{ t('management.noAppsTitle') }}</h3>
                <p>{{ t('management.noAppsText') }}</p>
            </div>

            <div v-else class="applications-grid">
                <div v-for="app in data" :key="app.name" class="app-card">
                    <div class="app-header">
                        <div class="app-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <h3 class="app-name">{{ app.name }}</h3>
                        <button
                            class="icon-btn edit-btn"
                            :title="t('management.edit')"
                            :aria-label="t('management.edit')"
                            @click="openEdit(app)"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
                            </svg>
                        </button>
                    </div>

                    <p v-if="app.shortDescription" class="app-description">{{ app.shortDescription }}</p>

                    <a v-if="app.url" :href="app.url" class="app-url" target="_blank" rel="noopener">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        {{ app.url }}
                    </a>

                    <div v-if="app.roles.length > 0" class="app-roles">
                        <h4 class="roles-title">{{ t('management.rolesPermissions') }}</h4>
                        <div class="roles-list">
                            <div v-for="role in app.roles" :key="role.name" class="role-item">
                                <div class="role-info">
                                    <span class="role-name">{{ role.name }}</span>
                                    <span class="role-count">{{ t('management.usersCount', { count: role.usersCount }) }}</span>
                                </div>
                                <div class="role-indicator"></div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="no-roles">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <span>{{ t('management.noRoles') }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="editModal" class="modal-overlay" @click.self="closeEdit">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
                        </svg>
                    </div>
                    <h3>{{ t('management.editModalTitle') }}</h3>
                    <p class="modal-subtitle">{{ t('management.editModalText') }}</p>
                </div>

                <form @submit.prevent="saveEdit">
                    <div class="form-group">
                        <label class="form-label" for="app-name">{{ t('management.nameLabel') }}</label>
                        <input
                            id="app-name"
                            type="text"
                            class="form-input"
                            v-model="editModal.name"
                            :placeholder="t('management.namePlaceholder')"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="app-short-description">{{ t('management.shortDescriptionLabel') }}</label>
                        <input
                            id="app-short-description"
                            type="text"
                            class="form-input"
                            v-model="editModal.shortDescription"
                            :placeholder="t('management.shortDescriptionPlaceholder')"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="app-url">{{ t('management.urlLabel') }}</label>
                        <input
                            id="app-url"
                            type="url"
                            class="form-input"
                            v-model="editModal.url"
                            :placeholder="t('management.urlPlaceholder')"
                        />
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary btn-sm" :disabled="isSaving">
                            <div v-if="isSaving" class="loading"></div>
                            {{ isSaving ? t('management.saving') : t('management.save') }}
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" @click="closeEdit" :disabled="isSaving">
                            {{ t('management.cancel') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.management-header {
    margin-bottom: 2rem;
}

.welcome-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: white;
    flex-shrink: 0;
}

.welcome-content h1 {
    margin: 0 0 0.5rem 0;
    text-align: left;
    font-size: 2rem;
}

.welcome-message {
    color: #6b7280;
    font-size: 1.1rem;
    margin: 0;
}

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

.applications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.app-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.app-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.app-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 12px;
    color: #667eea;
    flex-shrink: 0;
}

.app-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
}

.edit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-left: auto;
    border: none;
    border-radius: 10px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.edit-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-1px);
}

.app-description {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
}

.app-url {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: #667eea;
    font-size: 0.8rem;
    text-decoration: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.5rem;
}

.app-url:hover {
    text-decoration: underline;
}

.app-url svg {
    flex-shrink: 0;
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
    max-width: 520px;
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

.modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.modal-actions .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.app-roles {
    margin-top: 1rem;
}

.roles-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
}

.roles-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.role-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.role-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.role-name {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
}

.role-count {
    font-size: 0.75rem;
    color: #6b7280;
}

.role-indicator {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
}

.no-roles {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    color: #9ca3af;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
    .welcome-section {
        flex-direction: column;
        text-align: center;
        padding: 1.5rem;
    }
    
    .welcome-content h1 {
        text-align: center;
        font-size: 1.75rem;
    }
    
    .applications-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .app-card {
        padding: 1rem;
    }
    
    .app-header {
        gap: 0.75rem;
    }
    
    .app-icon {
        width: 40px;
        height: 40px;
    }
    
    .app-name {
        font-size: 1.125rem;
    }
}

@media (max-width: 480px) {
    .welcome-section {
        padding: 1rem;
    }
    
    .welcome-icon {
        width: 60px;
        height: 60px;
    }
    
    .welcome-content h1 {
        font-size: 1.5rem;
    }
    
    .welcome-message {
        font-size: 1rem;
    }
    
    .app-card {
        padding: 0.75rem;
    }
    
    .role-item {
        padding: 0.5rem;
    }
}
</style>