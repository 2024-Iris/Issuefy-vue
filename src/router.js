import { createRouter, createWebHistory } from 'vue-router';
import TestCp from './components/TestCp.vue';
import HelloWorld from './components/HelloWorld.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HelloWorld },
    { path: '/testcp', component: TestCp },
  ],
});

export default router;
