<template>
  <div class="langchain-demo chat">
    <h2>langchain-embedding</h2>

    <!-- 文件上传 -->
    <input type="file" name="file" id="fileIpt" @change="uploadFile" />
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

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';

import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const input = ref(''); // 问题
const loading = ref(false);
const messageList = ref([]); //结果列表
const lock = ref(false); // 用来处理第一时间的响应
const chatModel = ref(); // 模型实例
const vectorStore = ref(); // 检索链

createModel();

async function ask() {
  if (input.value.trim() === '') return;
  lock.value = false;
  loading.value = true;
  messageList.value.push({
    role: 'user',
    content: input.value,
    time: Date.now()
  });
  // input.value = '';

  const params = messageList.value.map(msg => {
    if ((msg.role = 'user')) return new HumanChatMessage(msg.content);
    if ((msg.role = 'assistant')) return new AIChatMessage(msg.content);
  });
  // chatModel.value.call(params);
  // const res = await chain.value.call({ query });
  // console.log('====\n', res, '\n====\n');

  const resultOne = await vectorStore.value.similaritySearch(input.value, 1);
  console.log('====\n', resultOne, '\n====\n');
}

const formatDate = date => format(date, 'yyyy-MM-dd HH:mm:ss');

// 上传文件
async function uploadFile() {
  const file = document.getElementById('fileIpt').files[0];
  const fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = async function (e) {
    const docs = e.target.result;
    const output = await splitDocs(docs);
    createChain(output);
  };
}

// 1. 分割文档
async function splitDocs(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50
  });
  const output = await splitter.createDocuments([text]);
  return output;
}

async function createChain(docs) {
  console.log(docs);
  // 2. 创建内存向量索引数据库（为了快速演示，只导入前 1 段）
  const embeddings = new OpenAIEmbeddings(
    { openAIApiKey: OPENAI_KEY },
    { basePath: BASE_URL }
  );
  vectorStore.value = await MemoryVectorStore.fromDocuments(docs, embeddings);

  // chain.value = VectorDBQAChain.fromLLM(chatModel.value, vectorStore, { k: 1 });
}

// 实例化模型
function createModel() {
  chatModel.value = new ChatOpenAI(
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
            messageList.value.at(-1).content += marked.parse(content);
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
}
</script>
