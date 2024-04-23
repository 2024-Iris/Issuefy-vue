<script setup>

</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center space-y-4"> <!-- flex-col 및 space-y-4 추가 -->
    <div>
      <img src="../assets/issuefy_logo.png" alt="main.logo" class="h-96 w-auto"> <!-- h-24 크기 클래스 추가 -->
    </div>
    <div>
      <router-link to="/">
        <button
            class="rounded-lg bg-purple-500 px-6 py-2 text-white hover:bg-purple-600 focus:outline-none focus:ring focus:ring-purple-300">
          GitHub으로 로그인
        </button>
      </router-link>
    </div>
  </div>
</template>


<style scoped>

</style>