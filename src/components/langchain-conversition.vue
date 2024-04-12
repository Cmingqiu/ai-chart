<template>
  <div class="langchain-demo chat">
    <h2>对话</h2>

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

import { loadQARefineChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { documentChat } from '../http/local.api';

const input = ref(''); // 问题
const loading = ref(false);
const messageList = ref([]); //结果列表
const lock = ref(false); // 用来处理第一时间的响应
let chatModel = null; // 模型实例
let outputDoc = null;

async function init() {
  const loader = new CheerioWebBaseLoader(
    'https://cmingqiu.github.io/blog/start/'
  );
  const docs = await loader.loadAndSplit(splitter);
}

async function ask() {
  if (input.value.trim() === '') return;
  lock.value = false;
  loading.value = true;
  messageList.value.push({
    role: 'user',
    content: input.value,
    time: Date.now()
  });

  const params = messageList.value.map(msg => {
    if ((msg.role = 'user')) return new HumanChatMessage(msg.content);
    if ((msg.role = 'assistant')) return new AIChatMessage(msg.content);
  });
  // chatModel.call(params);
  // const res = await chain.value.call({ query });

  // const result = await createChain(input.value);

  const result = await documentChat(input.value);
  console.log('====\n', result.text, '\n====\n');
  messageList.value.push({
    role: 'assistant',
    content: result.text,
    time: Date.now()
  });
  input.value = '';
  lock.value = false;
  loading.value = false;
}

const formatDate = date => format(date, 'yyyy-MM-dd HH:mm:ss');

// 上传文件
async function uploadFile() {
  const file = document.getElementById('fileIpt').files[0];
  const fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = async function (e) {
    // const docs = e.target.result;
    const docs = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
This is a weird text to write, but gotta test the splittingggg some how.\n\n
Bye!\n\n-H.`;
    outputDoc = await splitDocs(docs);
    console.log('[# of split documents > ]', docs.length, docs);
  };
}

// 1. 分割文档
async function splitDocs(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10,
    chunkOverlap: 1
  });
  return await splitter.splitDocuments([new Document({ pageContent: text })]);
}

//  2. 创建对话链 QA
async function createChain(question) {
  // 实例化模型
  chatModel = new ChatOpenAI(
    {
      openAIApiKey: OPENAI_KEY
      /* streaming: true,
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
            messageList.value.at(-1).content += content; //marked.parse();
          },
          // 结束的回调
          handleLLMEnd(output) {
            loading.value = false;
            lock.value = false;
          }
        }
      ] */
    },
    { basePath: BASE_URL }
  );

  const chainQA = loadQARefineChain(chatModel);
  const answer = await chainQA.call({
    input_documents: outputDoc.slice(0, 1),
    question
  });
  console.log('[ answer ] >', answer);
}
</script>
