import {createRouter, createWebHistory} from 'vue-router';
import LoginPage from "@/components/LoginPage.vue";
import GithubAuth from "@/components/GithubAuth.vue";
import {ref} from "vue";
import {useAuthStore} from "@/store/pinia";
import LogoutPage from "@/components/LogoutPage.vue";
import RepositoryPage from "@/components/RepositoryPage.vue";
import NotFoundPage from "@/components/NotFoundPage.vue";
import HomePage from "@/components/HomePage.vue";
import SettingPage from "@/components/SettingPage.vue";
import IssuePage from "@/components/IssuePage.vue";
import axios from "axios";
import ExpiredPage from "@/components/ExpiredPage.vue";
import IssueDetailPage from "@/components/IssueDetailPage.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: {
            requiresAuth: true,
            hideAddBox: true,
            hideListName: true
        }
    },
    {
        path: '/repositories',
        name: 'repositories',
        component: RepositoryPage,
        meta: {
            requiresAuth: true,
            hideAddBox: false,
            hideListName: false
        },
    },
    {
        path: '/:org/:repository/issues',
        name: 'issue',
        component: IssuePage,
        meta: {
            requiresAuth: true,
            hideListName: false
        },
        props: true
    },
    {
        path: '/:org/:repository/issues/:issueId',
        name: 'issueDetail',
        component: IssueDetailPage,
        meta: {
            requiresAuth: true,
        },
        props: true
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingPage,
        meta: {requiresAuth: true}
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: {hideHeader: true}
    },
    {
        path: '/logout',
        name: 'logout',
        component: LogoutPage,
        meta: {hideHeader: true}
    },
    {
        path: '/callback',
        name: 'callback',
        component: GithubAuth,
        meta: {hideHeader: true}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: NotFoundPage,
        meta: {requiresAuth: true}
    },
    {
        path: '/expired',
        name: 'expired',
        component: ExpiredPage,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            const authStore = useAuthStore();
            authStore.clearCredentials();
            router.push('/expired');
        }
        return Promise.reject(error);
    }
);

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isLogin = ref(authStore.isLoggedIn);

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isLogin.value) {
            next('/login');
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;
