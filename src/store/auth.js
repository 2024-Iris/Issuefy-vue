import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    JWT: null,
    userName: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.JWT,
  },
  actions: {
    setCredentials(JWT, userName) {
      this.$patch({
        JWT,
        userName
      });
    },
    clearCredentials() {
      this.$patch({
        JWT: null,
        userName: null
      });
    }
  }
});