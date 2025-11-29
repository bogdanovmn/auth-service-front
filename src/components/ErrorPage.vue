<script setup lang="ts">
import { useRouter } from 'vue-router';

import { notificationStore } from "../stores/notifications";


const router = useRouter()
const notifStore = notificationStore();

function goBack() {
    window.history.back()
}

function goHome() {
    router.push('/')
}
</script>

<template>
    <div class="container-xs">
        <div class="card">
            <div class="error-header">
                <div class="error-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                </div>
                <h1>Oops! Something went wrong</h1>
                <p class="error-subtitle">We encountered an unexpected error</p>
            </div>

            <div class="error-content">
                <div class="error-message">
                    <h3>Error Details</h3>
                    <div class="error-details">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        <span>{{ notifStore.getError() }}</span>
                    </div>
                </div>

                <div class="error-actions">
                    <button @click="goBack" class="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"/>
                            <polyline points="12,19 5,12 12,5"/>
                        </svg>
                        Go Back
                    </button>
                    <button @click="goHome" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9,22 9,12 15,12 15,22"/>
                        </svg>
                        Go Home
                    </button>
                </div>
            </div>

            <div class="error-footer">
                <p>If this problem persists, please contact support.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.error-header {
    text-align: center;
    margin-bottom: 2rem;
}

.error-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.error-icon svg {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    padding: 1.5rem;
    border-radius: 50%;
}

.error-subtitle {
    color: #6b7280;
    font-size: 1.1rem;
    margin-top: 0.5rem;
}

.error-content {
    margin-bottom: 2rem;
}

.error-message {
    margin-bottom: 2rem;
}

.error-message h3 {
    color: #374151;
    margin-bottom: 1rem;
    font-size: 1.125rem;
}

.error-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(254, 226, 226, 0.5);
    border: 1px solid rgba(252, 165, 165, 0.3);
    border-radius: 12px;
    color: #dc2626;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    word-break: break-word;
}

.error-details svg {
    color: #dc2626;
    flex-shrink: 0;
}

.error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.error-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.error-footer p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .error-actions {
        flex-direction: column;
    }
    
    .error-actions .btn {
        width: 100%;
    }
    
    .error-details {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .error-header {
        margin-bottom: 1.5rem;
    }
    
    .error-icon svg {
        width: 48px;
        height: 48px;
        padding: 1rem;
    }
    
    .error-subtitle {
        font-size: 1rem;
    }
    
    .error-details {
        padding: 0.75rem;
        font-size: 0.8rem;
    }
}
</style>