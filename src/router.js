import {createRouter, createWebHistory} from 'vue-router';
import TestCp from "@/components/TestCp.vue";
import HomePage from "@/components/HomePage.vue";
import LoginPage from "@/components/LoginPage.vue";
import Store from "@/store/index"

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: HomePage,
            meta: {requiresAuth: true}
        },
        {
            path: '/testcp',
            component: TestCp
        },
        {
            path: '/login',
            component: LoginPage,
            meta: {hideHeader: true}
        }
    ],
});

router.beforeEach((to, from, next) => {
  // 이동하려는 라우트에 대해 'requiresAuth' 메타가 있는지 확인
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Vuex 스토어에서 로그인 상태 확인
    if (!Store.getters.isLoggedIn) {
      // 로그인되지 않았다면 로그인 페이지로 리다이렉트
      next('/login');
    } else {
      // 로그인된 상태라면 요청한 라우트로 진행
      next();
    }
  } else {
    // 'requiresAuth' 메타가 없는 라우트는 그대로 진행
    next();
  }
});

export default router;
