<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { ApplictionsOverview, SsoResourcesService } from '../common/sso-resources-service';
    import { tokenStorage } from "@bogdanovmn/ssofw"


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!

    const data = ref<ApplictionsOverview[]>()
    ssoResourceService.applicationsOverview()
        .then(overview => data.value = overview)

</script>

<template>
    <div class="container">
        <div class="management-header">
            <div class="welcome-section">
                <div class="welcome-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div class="welcome-content">
                    <h1>Management Dashboard</h1>
                    <p class="welcome-message">Welcome back, <strong>{{ tokenStorage.claims?.userName }}</strong></p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="section-header">
                <h2>Applications Overview</h2>
                <p class="section-subtitle">Manage and monitor your applications</p>
            </div>

            <div v-if="!data" class="loading-state">
                <div class="loading"></div>
                <p>Loading applications...</p>
            </div>

            <div v-else-if="data.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
                <h3>No Applications Found</h3>
                <p>There are no applications to display at the moment.</p>
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
                    </div>

                    <div v-if="app.roles.length > 0" class="app-roles">
                        <h4 class="roles-title">Roles & Permissions</h4>
                        <div class="roles-list">
                            <div v-for="role in app.roles" :key="role.name" class="role-item">
                                <div class="role-info">
                                    <span class="role-name">{{ role.name }}</span>
                                    <span class="role-count">{{ role.usersCount }} users</span>
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
                        <span>No roles assigned</span>
                    </div>
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