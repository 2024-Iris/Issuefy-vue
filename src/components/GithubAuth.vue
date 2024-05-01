<script setup>
import { onMounted, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const authorizationCode = route.query.code;
const authStore = useAuthStore();
const userName = computed(() => authStore.userName);

async function fetchJWT(code) {
  try {
    const response = await axios.get('http://localhost:8080/api/login', {
      params: { code }
    });
    const { jwt, userName } = response.data;
    return { jwt, userName };
  } catch (error) {
    console.error('접근 토큰 가져오기 에러:', error);
    return null;
  }
}

onMounted(async () => {
  const error = route.query.error;
  if (error) {
    console.log('로그인 에러:', error);
    await router.push('/login');
  } else if (authorizationCode) {
    const { jwt, userName } = await fetchJWT(authorizationCode);
    if (jwt && userName) {
      authStore.setCredentials(jwt, userName);
      await nextTick(); // UI 업데이트가 반영되도록 강제 적용
      console.log('로그인 성공, 사용자 이름:', userName);
      await router.push('/');
    } else {
      console.log('JWT 또는 사용자 이름을 받지 못함, 로그인 페이지로 리디렉션');
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