<script setup lang="ts">
    import { ref, inject, reactive } from 'vue'
    import { AuthToken } from '../common/auth-token'
    import AuthRequest from '../common/auth-request'

    const authToken = inject<AuthToken>("authToken")!
    const http = inject<AuthRequest>("http")!

    const data = ref<ApplictionsOverview>()

    type ApplictionsOverview = {
        id: number;
        name: string;
        roles: Role[]
    }

    type Role = {
        name: string;
        usersCount: number;
    }

    function loadApplications() {
        return http.get<ApplictionsOverview>("http://localhost:8091/applications")
            .then(resp => data.value = resp)
    }

    loadApplications()

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