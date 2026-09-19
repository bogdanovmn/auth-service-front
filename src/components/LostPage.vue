<script setup lang="ts">
    import { inject, ref } from 'vue'
    import { AvailableService, SsoResourcesService } from '../common/sso-resources-service';
    import { authStore } from "../stores/auth"
    import { t } from '../i18n'

    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!
    const auth = authStore()
    auth.update()

    const services = ref<AvailableService[]>()
    const loadFailed = ref(false)

    ssoResourceService.availableServices()
        .then(list => services.value = list)
        .catch(err => {
            console.error('Load available services error:', err)
            loadFailed.value = true
        })

    function linkText(service: AvailableService): string {
        return service.shortDescription?.trim() || service.name
    }

    function hostName(service: AvailableService): string {
        try {
            return new URL(service.url).host
        } catch (err) {
            return service.url
        }
    }
</script>

<template>
    <div class="container-sm">
        <div class="card">
            <div class="lost-header">
                <div class="lost-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v20"/>
                        <path d="M2 12h20"/>
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M6.3 6.3l11.4 11.4"/>
                        <path d="M17.7 6.3L6.3 17.7"/>
                    </svg>
                </div>
                <h1 class="greeting">{{ t('lost.hello', { name: auth.userName ?? '' }) }}</h1>
                <p class="lost-subtitle">{{ t('lost.message') }}</p>
            </div>

            <div v-if="!services && !loadFailed" class="loading-state">
                <div class="loading loading-dark"></div>
                <p>{{ t('lost.loading') }}</p>
            </div>

            <div v-else-if="loadFailed" class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {{ t('lost.loadFailed') }}
            </div>

            <div v-else-if="(services?.length ?? 0) === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
                <h3>{{ t('lost.noServicesTitle') }}</h3>
                <p>{{ t('lost.noServicesText') }}</p>
            </div>

            <div v-else class="services-list">
                <a v-for="service in services" :key="service.name" :href="service.url" class="service-link">
                    <div class="service-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="service-info">
                        <span class="service-name">{{ linkText(service) }}</span>
                        <span class="service-host">{{ hostName(service) }}</span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="service-arrow">
                        <line x1="7" y1="17" x2="17" y2="7"/>
                        <polyline points="7,7 17,7 17,17"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</template>

<style scoped>
.lost-header {
    text-align: center;
    margin-bottom: 2rem;
}

.lost-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;
}

.lost-icon svg {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 1.25rem;
    border-radius: 50%;
}

.greeting {
    margin-bottom: 0.75rem;
}

.lost-subtitle {
    color: #6b7280;
    font-size: 1.1rem;
    margin: 0;
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1rem;
    text-align: center;
}

.loading-state p, .empty-state p {
    color: #6b7280;
    margin-top: 1rem;
}

.loading-dark {
    border-color: rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
}

.empty-state svg {
    color: #d1d5db;
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: #374151;
    margin-bottom: 0.5rem;
}

.services-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.service-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.25s ease;
}

.service-link:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.06);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
}

.service-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 12px;
    color: #667eea;
    flex-shrink: 0;
}

.service-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    flex: 1;
}

.service-name {
    font-weight: 600;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.service-host {
    font-size: 0.8rem;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.service-arrow {
    color: #9ca3af;
    flex-shrink: 0;
    transition: color 0.25s ease, transform 0.25s ease;
}

.service-link:hover .service-arrow {
    color: #667eea;
    transform: translate(2px, -2px);
}

@media (max-width: 480px) {
    .lost-header {
        margin-bottom: 1.5rem;
    }

    .lost-icon svg {
        width: 44px;
        height: 44px;
        padding: 1rem;
    }

    .lost-subtitle {
        font-size: 1rem;
    }
}
</style>