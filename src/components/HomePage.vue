<script setup>
import store from "@/store";
import {ref, watchEffect} from "vue";

const isLogin = ref(false);

watchEffect(() => {
  isLogin.value = store.getters.isLoggedIn;
});
</script>

<template>
  <main class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
    <div v-if="isLogin">
      <p>로그인 됨</p>
    </div>
    <div v-else>
      <p>로그인 안됨</p>
    </div>
    <div class="text-center">
      <p class="text-base font-semibold text-indigo-600">404</p>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">페이지를 찾을수 없습니다.</h1>
      <p class="mt-6 text-base leading-7 text-gray-600">본문 내용</p>
    </div>
  </main>
</template>

<style scoped>

</style>