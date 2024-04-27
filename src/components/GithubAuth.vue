<script setup>
import {useRoute, useRouter} from 'vue-router';
import {onMounted, ref} from "vue";
import {useAuthStore} from "@/store/auth";

const router = useRouter();
const route = useRoute();
const userName = ref('')
const authorizationCode = route.query.code;

onMounted(() => {
  const error = route.query.error;
  if (error) {
    // 에러가 있는 경우 로그인 페이지로 리디렉트
    router.push('/login');
  } else {
    const authStore = useAuthStore()
    const token = 'ASDJI21388SAASDOGMV'
    const user = {name: 'roy'}
    authStore.setCredentials(token, user)
    userName.value = authStore.user.name
    console.log(userName)
    // 에러가 없는 경우 추가 로직 수행 (예: 액세스 토큰 요청 등)
    if (authorizationCode) {
      // 예를 들어, API를 통해 서버로 code를 보내고 처리 결과를 기다립니다.
      // 처리 결과에 따라 다음 스텝으로 진행하거나 에러 핸들링을 할 수 있습니다.
      // 여기에 API 요청 로직을 구현하세요.
    }
  }
});
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-start space-y-4">
    <h1>깃허브 로그인</h1>
    <p>AuthorizationCode : {{ authorizationCode }}</p>
    <p>이름 : {{userName}} </p>
  </div>
</template>

<style scoped>

</style>