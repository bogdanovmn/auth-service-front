<script setup lang="ts">
    import { ref, inject, reactive } from 'vue'

    const authToken = inject("authToken")
    const http = inject("http")

    const data = ref({})

    function loadApplications() {
        return http.get("http://localhost:8091/applications")
            .then(resp => data.value = resp.data)
    }

    data.value = loadApplications()

</script>

<template>
    <h1>Private Page</h1>

    Hello, {{authToken.userName()}}

    <h2>Data</h2>
    {{data}}

    <div>
    </div>
</template>

<style scoped>

</style>