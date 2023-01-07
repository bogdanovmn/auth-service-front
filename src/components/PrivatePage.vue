<script setup lang="ts">
    import { ref, inject } from 'vue'

    const authToken = inject("authToken")
</script>

<template>
    <h1>Private Page</h1>

    Hello, {{authToken.userName()}}

    <div>
    </div>
</template>

<style scoped>

</style>