<script setup>
import { onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/pinia';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const authorizationCode = route.query.code;
const authStore = useAuthStore();

async function fetchJWT(code) {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_URL}/login`, {
      params: { code }
    });
    const { jwt, userName, avatarURL } = response.data;
    const { accessToken, refreshToken } = jwt;
    return { accessToken, refreshToken, userName, avatarURL };
  } catch (error) {
    console.error('Error fetching JWT:', error);
    return null;
  }
}

onMounted(async () => {
  const error = route.query.error;
  if (error) {
    await router.push('/login');
  } else if (authorizationCode) {
    const tokens = await fetchJWT(authorizationCode);
    if (tokens && tokens.accessToken && tokens.userName) {
      authStore.setCredentials(tokens.accessToken, tokens.refreshToken, tokens.userName, tokens.avatarURL);
      await nextTick();
      await router.push('/');
    } else {
      await router.push('/login');
    }
  }
});
</script>


<template>
  <div class="flex h-screen flex-col items-center justify-start space-y-4">
  </div>
</template>

<style scoped>

</style>