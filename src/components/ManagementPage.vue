<script setup lang="ts">
    import { ref, computed, inject } from 'vue'
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

    type AddForm = {
        name: string
        roles: string[]
    }

    const roleOptions = [
        { value: 'user', label: t('management.roleNameUser') },
        { value: 'admin', label: t('management.roleNameAdmin') },
        { value: 'moderator', label: t('management.roleNameModerator') },
    ]

    const data = ref<ApplictionsOverview[]>()
    const alert = ref("")
    const editModal = ref<EditForm | null>(null)
    const addModal = ref<AddForm | null>(null)
    const deleteModal = ref<ApplictionsOverview | null>(null)
    const isSaving = ref(false)
    const isDeleting = ref(false)

    const activeTab = ref<'active' | 'inactive'>('active')

    const activeApps = computed(() => (data.value ?? []).filter(app => app.active))
    const inactiveApps = computed(() => (data.value ?? []).filter(app => !app.active))
    const showTabs = computed(() => activeApps.value.length > 0 && inactiveApps.value.length > 0)
    const visibleApps = computed(() => {
        if (showTabs.value) {
            return activeTab.value === 'active' ? activeApps.value : inactiveApps.value
        }
        return activeApps.value.length > 0 ? activeApps.value : inactiveApps.value
    })

    function isSystemApp(app: ApplictionsOverview): boolean {
        return app.name === 'any'
    }

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
        const name = editModal.value.name.trim()
        if (name.toLowerCase() === 'any') {
            alert.value = t('management.systemNameRestricted')
            return
        }
        isSaving.value = true
        alert.value = ""
        ssoResourceService.updateApplication(editModal.value.id, {
            name: name,
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

    function openAdd() {
        alert.value = ""
        addModal.value = { name: '', roles: [] }
    }

    function closeAdd() {
        if (isSaving.value) return
        addModal.value = null
    }

    function saveAdd() {
        if (!addModal.value) return
        const name = addModal.value.name.trim()
        if (name.toLowerCase() === 'any') {
            alert.value = t('management.systemNameRestricted')
            return
        }
        isSaving.value = true
        alert.value = ""
        ssoResourceService.createApplication({
            name: name,
            roles: addModal.value.roles
        })
            .then(() => {
                isSaving.value = false
                closeAdd()
                load()
            })
            .catch(err => {
                console.error('Create application error:', err)
                alert.value = t('management.addFailed')
            })
            .finally(() => {
                isSaving.value = false
            })
    }

    function openDelete(app: ApplictionsOverview) {
        alert.value = ""
        deleteModal.value = app
    }

    function closeDelete() {
        if (isDeleting.value) return
        deleteModal.value = null
    }

    function confirmDelete() {
        if (!deleteModal.value) return
        isDeleting.value = true
        alert.value = ""
        ssoResourceService.deactivateApplication(deleteModal.value.id)
            .then(() => {
                isDeleting.value = false
                closeDelete()
                load()
            })
            .catch(err => {
                console.error('Deactivate application error:', err)
                alert.value = t('management.deleteFailed')
            })
            .finally(() => {
                isDeleting.value = false
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
                <div class="header-actions">
                    <button class="btn btn-primary btn-sm" @click="openAdd">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        {{ t('management.add') }}
                    </button>
                </div>
            </div>

            <div v-if="alert" class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ alert }}
            </div>

            <div v-if="data && showTabs" class="status-tabs-wrap">
                <div class="status-tabs">
                    <button
                        class="status-tab"
                        :class="{ active: activeTab === 'active' }"
                        @click="activeTab = 'active'"
                    >{{ t('management.tabActive', { count: activeApps.length }) }}</button>
                    <button
                        class="status-tab"
                        :class="{ active: activeTab === 'inactive' }"
                        @click="activeTab = 'inactive'"
                    >{{ t('management.tabInactive', { count: inactiveApps.length }) }}</button>
                </div>
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
                <div v-for="app in visibleApps" :key="app.name" class="app-card" :class="{ 'app-card-inactive': !app.active }">
                    <div class="app-header">
                        <div class="app-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <h3 class="app-name">{{ app.name }}</h3>
                        <span v-if="isSystemApp(app)" class="system-badge">{{ t('management.systemApp') }}</span>
                        <span v-if="!app.active" class="inactive-badge">{{ t('management.inactive') }}</span>
                        <div class="app-actions">
                            <button
                                v-if="!isSystemApp(app)"
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
                            <button
                                v-if="app.active && !isSystemApp(app)"
                                class="icon-btn delete-btn"
                                :title="t('management.delete')"
                                :aria-label="t('management.delete')"
                                @click="openDelete(app)"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18"/>
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </button>
                        </div>
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

        <div v-if="addModal" class="modal-overlay" @click.self="closeAdd">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </div>
                    <h3>{{ t('management.addModalTitle') }}</h3>
                    <p class="modal-subtitle">{{ t('management.addModalText') }}</p>
                </div>

                <form @submit.prevent="saveAdd">
                    <div class="form-group">
                        <label class="form-label" for="new-app-name">{{ t('management.nameLabel') }}</label>
                        <input
                            id="new-app-name"
                            type="text"
                            class="form-input"
                            v-model="addModal.name"
                            :placeholder="t('management.namePlaceholder')"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">{{ t('management.rolesLabel') }}</label>
                        <div class="role-options">
                            <label v-for="option in roleOptions" :key="option.value" class="role-option">
                                <input type="checkbox" :value="option.value" v-model="addModal.roles" />
                                <span>{{ option.label }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary btn-sm" :disabled="isSaving">
                            <div v-if="isSaving" class="loading"></div>
                            {{ isSaving ? t('management.saving') : t('management.add') }}
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" @click="closeAdd" :disabled="isSaving">
                            {{ t('management.cancel') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="deleteModal" class="modal-overlay" @click.self="closeDelete">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-icon modal-icon-danger">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </div>
                    <h3>{{ t('management.deleteModalTitle') }}</h3>
                    <p class="modal-subtitle">{{ t('management.deleteModalText', { name: deleteModal.name }) }}</p>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-danger btn-sm" @click="confirmDelete" :disabled="isDeleting">
                        <div v-if="isDeleting" class="loading"></div>
                        {{ isDeleting ? t('management.saving') : t('management.delete') }}
                    </button>
                    <button class="btn btn-secondary btn-sm" @click="closeDelete" :disabled="isDeleting">
                        {{ t('management.cancel') }}
                    </button>
                </div>
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
    position: relative;
    margin-bottom: 2rem;
    text-align: center;
}

.section-header h2 {
    margin-bottom: 0.5rem;
}

.header-actions {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
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

.app-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
    flex-shrink: 0;
}

.edit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
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

.delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.delete-btn:hover {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    transform: translateY(-1px);
}

.inactive-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.system-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    background: rgba(107, 114, 128, 0.12);
    color: #4b5563;
}

.app-card-inactive {
    background: rgba(107, 114, 128, 0.04);
    border-style: dashed;
    border-color: rgba(107, 114, 128, 0.35);
}

.app-card-inactive:hover {
    background: rgba(107, 114, 128, 0.07);
    border-color: rgba(107, 114, 128, 0.45);
    transform: none;
}

.status-tabs-wrap {
    text-align: center;
    margin-bottom: 1.5rem;
}

.status-tabs {
    display: inline-flex;
    gap: 0.25rem;
    padding: 0.25rem;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.12);
    border-radius: 12px;
}

.status-tab {
    padding: 0.5rem 1.25rem;
    border: none;
    border-radius: 9px;
    background: transparent;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
}

.status-tab:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.06);
}

.status-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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

.modal-icon-danger svg {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}

.role-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.role-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.role-option:hover {
    background: rgba(102, 126, 234, 0.06);
    border-color: rgba(102, 126, 234, 0.3);
}

.role-option input {
    accent-color: #667eea;
    width: 16px;
    height: 16px;
    cursor: pointer;
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

    .header-actions {
        position: static;
        transform: none;
        margin-top: 1rem;
        display: flex;
        justify-content: center;
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