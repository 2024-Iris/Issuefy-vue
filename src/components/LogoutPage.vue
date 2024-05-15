<script setup>

import {useAuthStore} from "@/store/pinia";
import {useRouter} from "vue-router";

const authStore = useAuthStore()
const router = useRouter()

authStore.clearCredentials()
router.push('/login')
</script>

<template>
  <p></p>
</template>

