import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import '../style.css';
import store from './store';
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'

library.add(faGithub)

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router);
app.use(store);
app.mount('#app');