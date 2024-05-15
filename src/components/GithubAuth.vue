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
    const response = await axios.get('http://localhost:8080/api/login', {
      params: { code }
    });
    const { jwt, userName, avatarURL } = response.data;
    return { jwt, userName, avatarURL};
  } catch (error) {
    return null;
  }
}

onMounted(async () => {
  const error = route.query.error;
  if (error) {
    await router.push('/login');
  } else if (authorizationCode) {
    const { jwt, userName, avatarURL } = await fetchJWT(authorizationCode);
    if (jwt && userName) {
      authStore.setCredentials(jwt, userName, avatarURL);
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