import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import '../style.css'
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {faBell, faCheck, faCircleExclamation} from '@fortawesome/free-solid-svg-icons'
import {createPinia} from "pinia"
import clickOutside from './directives/clickOutside'
import {useAuthStore} from "@/store/pinia"
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'

library.add(faGithub, faCircleExclamation, faCheck, faBell)

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const authStore = useAuthStore()
authStore.initCredentials()

app.config.globalProperties.$axios = axios

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
               '</code></pre>'
      } catch (error) {
        console.error('Failed to highlight code block:', error)
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  },
  html: true,
  linkify: true,
  typographer: true
})
app.config.globalProperties.$md = md

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.directive('click-outside', clickOutside)
app.mount('#app')