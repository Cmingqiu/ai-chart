<template>
  <div id="app">
    <!-- <div>Vue</div>
    <div class="header">{{ header }}</div>
    <div class="footer">cvd</div>
    <XtzTab
      :tabList="tabList1"
      :activeIndex="1"
      :freshFlag="freshFlag"
     /> -->

    <!-- <Chat /> -->
    <ul>
      <router-link to="/chat">Chat</router-link>
      &nbsp;&nbsp;
      <router-link to="/langchain-chat">langchain-chat</router-link>
      &nbsp;&nbsp;
      <router-link to="/langchain-agent">langchain-agent</router-link>
      &nbsp;&nbsp;
      <router-link to="/langchain-conversition"
        >langchain-conversition</router-link
      >
      &nbsp;&nbsp;
      <router-link to="/langchain-embedding">langchain-embedding</router-link>
    </ul>

    <hr />
    <h1>v-html</h1>
    <div id="box"></div>
    <hr />
    <router-view></router-view>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
// import  from '@atom/xtz-ui'
import { getApi, fetchModels } from './http';

const html = 'cript>';

const header = ref('header');
const tabList1 = [
  {
    text: 'A股',
    id: 1
  },
  {
    text: '基金',
    id: 2
  },
  {
    text: '期货',
    id: 3
  },
  {
    text: '财商',
    id: 4
  },
  {
    text: '港美股',
    id: 5
  },
  {
    text: '求职',
    id: 6
  },
  {
    text: '求职2',
    id: 7
  }
];
const freshFlag = ref(false);
setTimeout(() => {
  freshFlag.value = true;
}, 1000);

onMounted(async () => {
  box.innerHTML = html;
  /* const { handler, ctl } = getApi();
  handler
    .then(res => {})
    .catch(err => {
      // console.log('=', axios.isCancel(err), err);
    });
  setTimeout(() => {
    // ctl.abort();
  }, 1000); */
});
</script>

<style lang="scss" scoped>
.header {
  background-color: aquamarine;
}
.footer {
  background-color: rgb(41, 137, 137);
}
</style>
