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

library.add(faGithub, faCircleExclamation, faCheck)

const app = createApp(App);
const pinia = createPinia()
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router);
app.use(pinia)
app.directive('click-outside', clickOutside);
app.mount('#app');
