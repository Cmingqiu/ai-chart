<template>
  <div class="langchain-demo chat">
    <h2>langchain-embedding</h2>

    <!-- 文件上传 -->
    <!-- <input type="file" name="file" id="fileIpt" @change="uploadFile" /> -->
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
          <div
            :class="['content-box', loading ? 'flashy' : '']"
            v-html="l.content"></div>
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
import { format } from 'date-fns';
import { marked } from 'marked';

import { chat } from '../hooks/sse';

const input = ref(''); // 问题
const loading = ref(false);
const messageList = ref([]); //结果列表
const lock = ref(false); // 用来处理第一时间的响应

async function ask() {
  if (input.value.trim() === '') return;
  lock.value = false;
  loading.value = true;
  messageList.value.push({
    role: 'user',
    content: input.value,
    time: Date.now()
  });
  // 这是前端开发的vue文件，你觉得有什么问题，以列表方式指出来，使用语言为中文

  chat(
    input.value,
    `http://localhost:3000/document-embedding`,
    data => {
      if (!lock.value) {
        lock.value = true;
        messageList.value.push({
          role: 'assistant',
          content: '',
          time: Date.now()
        });
      }

      if (data !== '[DONE]') {
        // 回答中
        const content = data ?? '';
        messageList.value.at(-1).content += content;
      } else {
        // 回答结束
        loading.value = false;
        lock.value = false;
      }
    },
    'get'
  );
  input.value = '';
}

const formatDate = date => format(date, 'yyyy-MM-dd HH:mm:ss');
</script>
