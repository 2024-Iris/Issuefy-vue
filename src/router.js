import { createRouter, createWebHistory } from 'vue-router';
import TestCp from "@/components/TestCp.vue";
import HomePage from "@/components/HomePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/testcp', component: TestCp}
  ],
});

export default router;
