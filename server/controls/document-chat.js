/* 
- 服务端处理文件，加载文件->文档分割 (-> 依次遍历向量化，存入vectorStore)->创建对话链
- 客户端发起问答请求（提问 -> 问题embedding -> 查询openai），返回结果
*/

// model
const { ChatOpenAI } = require('langchain/chat_models/openai');
const {
  HumanChatMessage,
  AIChatMessage,
  SystemChatMessage
} = require('langchain/schema');
// text splitter
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { TextLoader } = require('langchain/document_loaders/fs/text');
// chains
const {
  loadSummarizationChain,
  loadQARefineChain,
  LLMChain
} = require('langchain/chains');
// prompt
const { PromptTemplate } = require('langchain/prompts');

async function createDocumentChat(question) {
  // 实例化模型
  var chatModel = new ChatOpenAI(
    {
      openAIApiKey: process.env.OPENAI_KEY
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
            messageList.value.at(-1).content += marked.parse(content);
          },
          // 结束的回调
          handleLLMEnd(output) {
            console.log(output);
            loading.value = false;
            lock.value = false;
          }
        }
      ] */
    },
    { basePath: process.env.BASE_URL }
  );
  // 初始化文本分割器
  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 500,
  //   chunkOverlap: 10
  // });
  // const loader = new TextLoader('./public/test.vue');
  // const docs = await loader.loadAndSplit(splitter);
  // console.log('[ # of split documents ] >', docs.length);
  // console.log('[ docs ] >', docs.slice(0, 1));

  // 创建模板
  const sysPrompt = PromptTemplate.fromTemplate(
    // `你是一名专业的前端代码评审者，熟悉vue框架，需要指出vue文件中的问题，以列表的形式展示`
    `你是一名专业的{technology}人员，列出必备的职业亮点`
  );

  // return async question => {
  //  创建并执行问答链（为了快速演示，只查询前 3 段）
  // const chainQA = loadQARefineChain(chatModel, { verbose: true });
  const chainQA = new LLMChain({
    llm: chatModel,
    prompt: sysPrompt
    // verbose: true
  });
  const answer = await chainQA.call({
    technology: question
    // input_documents: docs.slice(0, 1),
    // question
  });
  console.log('[ answer ] >', answer);
  return answer;
  // };
}

module.exports = createDocumentChat;
