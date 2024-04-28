<script setup>

import {useAuthStore} from "@/store/auth";
import {useRouter} from "vue-router";

const authStore = useAuthStore()
const router = useRouter()

authStore.clearCredentials()
router.push('/login')
</script>

<template>
<p></p>
</template>

