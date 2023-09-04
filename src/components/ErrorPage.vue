<script setup lang="ts">
    import { tokenStorage } from "@bogdanovmn/ssofw"
</script>

<template>
    <h1>Somethong went wrong</h1>

    Hello, {{tokenStorage.claims?.userName}}! Are you lost?
</template>

<style scoped>
</style>