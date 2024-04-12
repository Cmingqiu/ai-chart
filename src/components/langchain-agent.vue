<template>
  <div class="langchain-demo chat">
    <h2>langchain-agent</h2>
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

import { OPENAI_KEY, SERP_API_KEY, BASE_URL } from '../config/const';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { WebBrowser } from 'langchain/tools/webbrowser';
import {
  HumanChatMessage,
  AIChatMessage,
  SystemChatMessage
} from 'langchain/schema';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const input = ref(''); // 问题
const loading = ref(false);
const messageList = ref([
  {
    role: 'assistant',
    time: Date.now(),
    content: marked.parse(
      `要修改 js langchain 的接口地址，需要打开相应的 js文件，找到接口地址的代码行进行修改即可。具体的操作步骤如下：
      1. 找到 js langchain 的文件：通常情况下，js langchain 的文件名可能会以“langchain”或相关的关键字命名，可以在项目文件夹中搜索这些关键字找到该文件。
2. 找到接口地址代码行：在文件中找到设置接口地址的代码行，通常为一个变量或常量。
3. 修改接口地址：将变量或常量的值修改成需要的接口地址即可，需要注意的是，修改后需要保存文件。

以下是一个修改 js langchain 接口地址的示例代码：

\`\`\`javascript
//设置接口地址
var api_url = "https://api.example.com";

//修改接口地址
api_url = "https://api.new-example.com";
\`\`\`

在这个示例中，我们将原来的接口地址修改成了“https://api.new-example.com”。这样，在之后的代码中，就会使用新的接口地址进行请求和处理。`
    )
  }
]); //结果列表
const lock = ref(false); // 用来处理第一时间的响应

const executor = ref(); //agent执行器
async function init() {
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
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: OPENAI_KEY
  });

  // 初始化代理工具
  const tools = [
    new SerpAPI(SERP_API_KEY, {
      location: 'Austin,Texas,United States',
      hl: 'en',
      gl: 'us'
    }),
    new Calculator(),
    new WebBrowser({ model: chatModel, embeddings })
  ];

  executor.value = await initializeAgentExecutorWithOptions(tools, chatModel, {
    agentType: 'chat-zero-shot-react-description',
    returnIntermediateSteps: true,
    verbose: true //显示过程
  });
}
init();

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
  // chatModel.call(params);
  const res = await executor.value.call({ input: input.value });
  console.log(`Got output ${res.output}`);

  console.log(
    `Got intermediate steps ${JSON.stringify(res.intermediateSteps, null, 2)}`
  );
}

const formatDate = date => format(date, 'yyyy-MM-dd HH:mm:ss');
</script>
