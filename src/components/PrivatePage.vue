<script setup lang="ts">
    import { ref, inject } from 'vue'
    import { ApplictionsOverview, SsoResourcesService } from '../common/sso-resources-service';
    import { tokenStorage } from '../common/token-storage'


    const ssoResourceService = inject<SsoResourcesService>("ssoResourceService")!

    const data = ref<ApplictionsOverview[]>()
    ssoResourceService.applicationsOverview()
        .then(overview => data.value = overview)

</script>

<template>
    <h1>Private Page</h1>

    Hello, {{tokenStorage.userName()}}

    <h2>Applications overview</h2>
    <div v-for="app in data" class="app">
        <span class="name">{{ app.name }}</span>
        <span v-if="app.roles.length > 0">
            has roles: [
            <span v-for="role in app.roles" class="role">
                {{ role.name }}<span class="note">({{ role.usersCount }})</span>
            </span>
            ]
        </span>
    </div>

    <div>
    </div>
</template>

<style scoped>
div.app { margin-bottom: 10px; padding: 5px;}
div.app span.name { font-weight: bold;}
div.app span.role { padding: 0px 5px;}
span.note { color: gray; }
</style>