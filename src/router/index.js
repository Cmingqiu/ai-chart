import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
const routes = [
  {
    name: 'Chat',
    path: '/chat',
    component: () => import('../components/chat.vue')
  },
  {
    name: 'LangchainChat',
    path: '/langchain-chat',
    component: () => import('../components/langchain-chat.vue')
  },
  {
    name: 'LangchainAgent',
    path: '/langchain-agent',
    component: () => import('../components/langchain-agent.vue')
  },
  {
    name: 'LangchainLoader',
    path: '/langchain-conversition',
    component: () => import('../components/langchain-conversition.vue')
  },
  {
    name: 'LangchainEmbedding',
    path: '/langchain-embedding',
    component: () => import('../components/langchain-embedding.vue')
  }
];
const router = new VueRouter({
  mode: 'hash',
  routes
});

export default router;
