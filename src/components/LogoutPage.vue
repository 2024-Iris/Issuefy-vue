<script setup>
import {useAuthStore} from "@/store/pinia";
import {useRouter} from "vue-router";
import axios from "axios";
import {onMounted} from 'vue';

const authStore = useAuthStore()
const router = useRouter()

async function performLogout() {
  try {
    const accessToken = authStore.accessToken;
    await axios.post(`${process.env.VUE_APP_API_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    await authStore.clearCredentials()
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

onMounted(() => {
  performLogout();
})
</script>

<template>
  <p></p>
</template>

