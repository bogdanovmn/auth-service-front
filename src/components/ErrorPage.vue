<script setup lang="ts">
    import { tokenStorage } from "@bogdanovmn/ssofw"

    const errorMsg = localStorage.getItem("errorMsg") || 'not found'

</script>

<template>
    <h1>Somethong went wrong</h1>
    <div class="error">{{ errorMsg }}</div>
</template>

<style scoped>
    div.error { padding: 10px; border: 1px solid rgb(247, 176, 176); color: rgb(44, 28, 28)}
</style>