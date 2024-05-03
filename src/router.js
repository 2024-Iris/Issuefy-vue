import {createRouter, createWebHistory} from 'vue-router';
import LoginPage from "@/components/LoginPage.vue";
import GithubAuth from "@/components/GithubAuth.vue";
import {ref} from "vue";
import {useAuthStore} from "@/store/auth";
import LogoutPage from "@/components/LogoutPage.vue";
import RepositoryPage from "@/components/RepositoryPage.vue";
import NotFoundPage from "@/components/NotFoundPage.vue"
import HomePage from "@/components/HomePage.vue";
import SettingPage from "@/components/SettingPage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: HomePage,
            meta: {requiresAuth: true}
        },
        {
            path: '/repositories',
            component: RepositoryPage,
            meta: {requiresAuth: true}
        },
        {
            path: '/settings',
            component: SettingPage,
            meta: {requiresAuth: true}
        },
        {
            path: '/login',
            component: LoginPage,
            meta: {hideHeader: true}
        },
        {
            path: '/logout',
            component: LogoutPage,
            meta: {hideHeader: true}
        },
        {
            path: '/callback',
            component: GithubAuth,
            meta: {hideHeader: true}
        },
        {
            path: '/:pathMatch(.*)*',
            component: NotFoundPage
        }
    ],
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const isLogin = ref(authStore.isLoggedIn)

    if (to.matched.some(record => record.meta.requiresAuth)) {
        // pinia 스토어에서 로그인 상태 확인
        if (!isLogin.value) {
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
