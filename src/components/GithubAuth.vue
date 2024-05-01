<script setup>
import axios from 'axios';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const route = useRoute();
const authorizationCode = route.query.code;

async function fetchJWT(code) {
  try {
    const response = await axios.get('http://localhost:8080/api/login', {
      params: { code: code }
    });
    const JWT = response.data.jwt;
    const userName = response.data.userName;
    return {JWT, userName};
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
}

onMounted(async () => {
  const error = route.query.error;
  if (error) {
    console.log('Login error:', error);
    await router.push('/login');
  } else if (authorizationCode) {
    try {
      const { JWT, userName } = await fetchJWT(authorizationCode);
      if (JWT && userName) {
        const authStore = useAuthStore();
        authStore.setCredentials(JWT, userName);
        console.log('Login successful, redirecting...');
        await router.push('/');
      } else {
        console.log('No JWT or username received, redirecting to login');
        await router.push('/login');
      }
    } catch (error) {
      console.error('Error during login:', error);
      await router.push('/login');
    }
  }
});
</script>


<template>
  <div class="flex h-screen flex-col items-center justify-start space-y-4">
    <h1>깃허브 로그인</h1>
    <p>AuthorizationCode : {{ authorizationCode }}</p>
    <p>이름 : {{ userName }} </p>
  </div>
</template>

<style scoped>

</style>