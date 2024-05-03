import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    JWT: null,
    userName: null,
    avatarURL: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.JWT,
  },
  actions: {
    setCredentials(JWT, userName, avatarURL) {
      this.$patch({
        JWT,
        userName,
        avatarURL
      });
    },
    clearCredentials() {
      this.$patch({
        JWT: null,
        userName: null,
        avatarURL: null
      });
    }
  }
});