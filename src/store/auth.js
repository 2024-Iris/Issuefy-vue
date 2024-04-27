import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null
  }),
  actions: {
    setCredentials(accessToken, user) {
      this.accessToken = accessToken;
      this.user = user;
    },
    clearCredentials() {
      this.accessToken = null;
      this.user = null;
    }
  }
});
