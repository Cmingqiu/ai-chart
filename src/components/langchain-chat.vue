<template>
  <div class="langchain-demo chat">
    <h2>langchain-chat</h2>
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

import { OPENAI_KEY, BASE_URL } from '../config/const';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  HumanChatMessage,
  AIChatMessage,
  SystemChatMessage
} from 'langchain/schema';

const input = ref(''); // 问题
const loading = ref(false);
const messageList = ref([]); //结果列表
const lock = ref(false); // 用来处理第一时间的响应

// 实例化模型
var chatModel = new ChatOpenAI(
  {
    openAIApiKey: OPENAI_KEY,
    streaming: true,
    callbacks: [
      {
        // 接收的回调
        handleLLMNewToken(token) {
          if (!lock.value) {
            lock.value = true;
            messageList.value.push({
              role: 'assistant',
              content: '',
              time: Date.now()
            });
          }

          // 回答中
          const content = token ?? '';
          messageList.value.at(-1).content += content; //marked.parse(content);
        },
        // 结束的回调
        handleLLMEnd(output) {
          console.log(output);
          loading.value = false;
          lock.value = false;
        }
      }
    ]
  },
  { basePath: BASE_URL }
);

async function ask() {
  if (input.value.trim() === '') return;
  lock.value = false;
  loading.value = true;
  messageList.value.push({
    role: 'user',
    content: input.value,
    time: Date.now()
  });
  input.value = '';

  const params = messageList.value.map(msg => {
    if ((msg.role = 'user')) return new HumanChatMessage(msg.content);
    if ((msg.role = 'assistant')) return new AIChatMessage(msg.content);
  });
  chatModel.call(params);
}

const formatDate = date => format(date, 'yyyy-MM-dd HH:mm:ss');
</script>
