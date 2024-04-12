import Vue from 'vue';
import router from './router';
import App from './App.vue';
import XtzUI from '@atom/xtz-ui';
import './styles';

/* element-ui */
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

/* markdown parse */
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

marked.use({
  silent: true,
  breaks: true,
  ...markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'javascript';
      return hljs.highlight(code, { language }).value;
    }
  })
});

/* 
const app = createApp(App);

app.use(XtzUI).mount('#app'); */

Vue.use(XtzUI);
Vue.use(ElementUI);
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
