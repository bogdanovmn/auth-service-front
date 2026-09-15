<script setup lang="ts">
    import { locale, setLocale } from '../i18n'
</script>

<template>
    <div class="locale-switcher">
        <button
            type="button"
            class="flag-btn"
            :class="{ active: locale === 'ru' }"
            title="Русский"
            aria-label="Русский"
            @click="setLocale('ru')"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="22" height="15">
                <rect width="3" height="2" fill="#ffffff"/>
                <rect y="0.667" width="3" height="0.667" fill="#0039a6"/>
                <rect y="1.333" width="3" height="0.667" fill="#d52b1e"/>
            </svg>
        </button>
        <button
            type="button"
            class="flag-btn"
            :class="{ active: locale === 'en' }"
            title="English"
            aria-label="English"
            @click="setLocale('en')"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="22" height="15">
                <clipPath id="uk-diagonals">
                    <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                </clipPath>
                <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" stroke-width="6"/>
                <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-diagonals)" stroke="#c8102e" stroke-width="4"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" stroke-width="10"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6"/>
            </svg>
        </button>
    </div>
</template>

<style scoped>
.locale-switcher {
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.flag-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 22px;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 6px;
    background: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.flag-btn svg {
    display: block;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.flag-btn:not(.active) {
    opacity: 0.45;
}

.flag-btn:not(.active):hover {
    opacity: 0.8;
}

.flag-btn.active {
    opacity: 1;
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.15);
}
</style>