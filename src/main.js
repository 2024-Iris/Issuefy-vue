import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import '../style.css';
import store from './store';
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {createPinia} from "pinia";

library.add(faGithub)

const app = createApp(App);
const pinia = createPinia()
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router);
app.use(store);
app.use(pinia)
app.mount('#app');
