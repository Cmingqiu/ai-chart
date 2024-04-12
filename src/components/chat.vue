<template>
  <div class="chat">
    <h2>
      快来和我聊天吧~
      <svg width="24px" height="24px" viewBox="140 140 520 520">
        <path
          d="m617.24 354a126.36 126.36 0 0 0 -10.86-103.79 127.8 127.8 0 0 0 -137.65-61.32 126.36 126.36 0 0 0 -95.31-42.49 127.81 127.81 0 0 0 -121.92 88.49 126.4 126.4 0 0 0 -84.5 61.3 127.82 127.82 0 0 0 15.72 149.86 126.36 126.36 0 0 0 10.86 103.79 127.81 127.81 0 0 0 137.65 61.32 126.36 126.36 0 0 0 95.31 42.49 127.81 127.81 0 0 0 121.96-88.54 126.4 126.4 0 0 0 84.5-61.3 127.82 127.82 0 0 0 -15.76-149.81zm-190.66 266.49a94.79 94.79 0 0 1 -60.85-22c.77-.42 2.12-1.16 3-1.7l101-58.34a16.42 16.42 0 0 0 8.3-14.37v-142.39l42.69 24.65a1.52 1.52 0 0 1 .83 1.17v117.92a95.18 95.18 0 0 1 -94.97 95.06zm-204.24-87.23a94.74 94.74 0 0 1 -11.34-63.7c.75.45 2.06 1.25 3 1.79l101 58.34a16.44 16.44 0 0 0 16.59 0l123.31-71.2v49.3a1.53 1.53 0 0 1 -.61 1.31l-102.1 58.95a95.16 95.16 0 0 1 -129.85-34.79zm-26.57-220.49a94.71 94.71 0 0 1 49.48-41.68c0 .87-.05 2.41-.05 3.48v116.68a16.41 16.41 0 0 0 8.29 14.36l123.31 71.19-42.69 24.65a1.53 1.53 0 0 1 -1.44.13l-102.11-59a95.16 95.16 0 0 1 -34.79-129.81zm350.74 81.62-123.31-71.2 42.69-24.64a1.53 1.53 0 0 1 1.44-.13l102.11 58.95a95.08 95.08 0 0 1 -14.69 171.55c0-.88 0-2.42 0-3.49v-116.68a16.4 16.4 0 0 0 -8.24-14.36zm42.49-63.95c-.75-.46-2.06-1.25-3-1.79l-101-58.34a16.46 16.46 0 0 0 -16.59 0l-123.31 71.2v-49.3a1.53 1.53 0 0 1 .61-1.31l102.1-58.9a95.07 95.07 0 0 1 141.19 98.44zm-267.11 87.87-42.7-24.65a1.52 1.52 0 0 1 -.83-1.17v-117.92a95.07 95.07 0 0 1 155.9-73c-.77.42-2.11 1.16-3 1.7l-101 58.34a16.41 16.41 0 0 0 -8.3 14.36zm23.19-50 54.92-31.72 54.92 31.7v63.42l-54.92 31.7-54.92-31.7z"
          fill="var(--gray-900)"></path>
      </svg>
    </h2>
    <!-- 对话列表 -->
    <div class="list">
      <div
        :class="['list-item', l.role]"
        v-for="(l, i) in messageList"
        :key="i">
        <img v-if="l.role === 'user'" src="../imgs/user.png" alt="" srcset="" />
        <img
          v-if="l.role === 'assistant'"
          src="../imgs/chatgpticon.png"
          alt=""
          srcset="" />
        <div class="talk">
          <div class="time">{{ formatDate(l.time) }}</div>
          <div class="content-box" v-html="l.content"></div>
        </div>
      </div>
    </div>

    <div class="question-row">
      <el-input
        v-model="input"
        type="textarea"
        placeholder="输入内容"></el-input>
      <el-button type="primary" @click="ask" :loading="loading">{{
        loading ? '稍等片刻' : '提问'
      }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { chat } from '../hooks/sse';
import { postCompletions, chatCompletions } from '../http';
import { format } from 'date-fns';
import { BASE_URL } from '../config/const';

const input = ref(''); // 问题
const loading = ref(false);
const messageList = ref([
  { role: 'user', content: 'usercontentcontentcontent', time: Date.now() },
  {
    role: 'assistant',
    content: `
      很抱歉，作为一个语言模型，我只能看到最近的对话历史，并不能获取到您之前所有的问题。由于我无法追溯整个对话历史，我只能看到当前对话中的问题和回答。\`\`\`const str = "const date = ''";const egex  /(?<=\`).*?(?=\`)/;const match = str.match(regex);\`\`\`如果您有具体的问题或需要帮助，我会尽力回答您。
      `,
    time: Date.now()
  }
]); //结果列表

/*一次性返回
 async function ask() {
  if (input.value.trim() === '') return;
  loading.value = true;
  messageList.value.push({ role: 'user', content: input.value });
  input.value = '';
  const res = await chatCompletions({
    messages: messageList.value
  });
  loading.value = false;
  messageList.value.push({
    role: 'assistant',
    content: res.choices[0].message.content
  });
} */
// 返回stream流
async function ask() {
  if (input.value.trim() === '') return;
  let lock = false;
  loading.value = true;
  messageList.value.push({
    role: 'user',
    content: input.value,
    time: Date.now()
  });
  input.value = '';
  chat(messageList.value, `${BASE_URL}/chat/completions`, data => {
    if (!lock) {
      lock = true;
      messageList.value.push({
        role: 'assistant',
        content: '',
        time: Date.now()
      });
    }

    if (data !== '[DONE]') {
      // 回答中
      const content = JSON.parse(data).choices[0].delta?.content ?? '';
      messageList.value.at(-1).content += content;
    } else {
      // 回答结束
      loading.value = false;
      lock = false;
    }
  });

  /*  const res = await chatCompletions({
    messages: messageList.value
  }); */
}

const formatDate = date => format(date, 'yyyy-MM-dd HH:mm:ss');
</script>
