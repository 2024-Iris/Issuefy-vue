import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import '../style.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import { faCircleExclamation, faCheck } from '@fortawesome/free-solid-svg-icons'
import {createPinia} from "pinia";
import clickOutside from './directives/clickOutside';
import {useAuthStore} from "@/store/pinia";
import { faBell } from '@fortawesome/free-solid-svg-icons';

library.add(faGithub, faCircleExclamation, faCheck, faBell)

const app = createApp(App);
const pinia = createPinia()
app.use(pinia)

const authStore = useAuthStore()
authStore.initCredentials()

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router);
app.directive('click-outside', clickOutside);
app.mount('#app');
