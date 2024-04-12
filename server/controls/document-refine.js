/**
 * 文档总结
 */

// model
const { ChatOpenAI } = require('langchain/chat_models/openai');
// text splitter
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { TextLoader } = require('langchain/document_loaders/fs/text');
// chains
const {
  loadSummarizationChain,
  loadQARefineChain,
  LLMChain
} = require('langchain/chains');
// pdf
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');

async function createDocumentRefine() {
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
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 10
  });

  // txt
  const loader = new TextLoader('./public/large.txt');
  // pdf
  /* const loader = new PDFLoader('./public/jl.pdf', {
    splitPages: false
  }); */

  const docs = await loader.load();
  console.log('[ # of split documents ] >', docs.length);

  // 创建并执行总结链（为了快速演示，只总结前 3 段）
  const chainSum = loadSummarizationChain(chatModel, {
    type: 'refine',
    verbose: true
  });
  const summary = await chainSum.call({ input_documents: docs });
  console.log('[ summary ] >', summary);
}

module.exports = createDocumentRefine;
