<script setup lang="ts">
    import { ref, inject, reactive } from 'vue'

    const authToken = inject("authToken")
    const http = inject("http")

    const data = ref({})


    class Application {
        id: number
        name: string
        roles: List<ApplicationRole>
    }

    class ApplicationRole {
        name: string
        userCounts: number
    }


    function loadApplications() {
        return http.get<List<Application>>("http://localhost:8091/applications")
            .then(resp => data.value = resp.data)
    }

     async function loadApplications1() {
        const { apps } = await http.get < List < Application >> ("http://localhost:8091/applications")
        console.log(apps[0])
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