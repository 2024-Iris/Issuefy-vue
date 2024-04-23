import { createStore } from 'vuex';

export default createStore({
  state: {
    // 사용자 정보를 저장하는 객체
    user: null
  },
  getters: {
    // 사용자 로그인 상태를 반환하는 getter
    isLoggedIn: state => state.user !== null
  },
  mutations: {
    // 사용자 정보를 상태에 설정하는 뮤테이션
    setUser(state, user) {
      state.user = user;
    },
    // 로그아웃 처리를 위한 뮤테이션
    logout(state) {
      state.user = null;
    }
  },
  actions: {
    // 사용자 로그인 처리를 위한 액션
    login({ commit }, user) {
      commit('setUser', user);
    },
    // 사용자 로그아웃 처리를 위한 액션
    logout({ commit }) {
      commit('logout');
    }
  }
});
