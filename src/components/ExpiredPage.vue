<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6">
      <div class="text-left">
        <h1 class="text-4xl font-bold mb-4">로그인 안내</h1>
        <p class="text-lg">토큰이 만료되었습니다.</p>
        <p class="text-lg mb-8">다시 로그인해주세요.</p>
      </div>
      <div class="text-left">
        <router-link class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" to="/login">
          로그인
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ExpiredPage',
}
</script>
<style scoped>
.container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>