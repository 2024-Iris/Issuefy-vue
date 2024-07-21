<script setup>
const clientId = process.env.VUE_APP_GITHUB_CLIENT_ID;
const redirectUri = encodeURIComponent(`${process.env.VUE_APP_CALLBACK_URL}`);

function handleGitHubLogin() {
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
}

</script>

<template>
  <div class="flex h-screen flex-col items-center justify-between space-y-4">
    <div class="flex flex-col items-center space-y-0 p-6 rounded-lg">
      <div>
        <img alt="main.logo" class="h-96 w-auto" src="../assets/issuefy_logo.png">
      </div>
      <div>
        <button
            class="rounded-lg bg-purple-500 px-4 py-3 text-white hover:bg-purple-600 focus:outline-none focus:ring focus:ring-purple-300"
            @click="handleGitHubLogin">
          <font-awesome-icon :icon="['fab', 'github']"/>
          GitHub Login
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>