const { ChatOpenAI } = require('langchain/chat_models/openai');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');

const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const {
  VectorDBQAChain,
  RetrievalQAChain,
  loadQARefineChain
} = require('langchain/chains');

const { Document } = require('langchain/document');

// 使用内存向量索引数据库构建问答机器人
async function documentEmbedding(question, cb) {
  console.log('==== question ===', question);
  const chatModel = new ChatOpenAI(
    {
      openAIApiKey: process.env.OPENAI_KEY,
      streaming: true
    },
    { basePath: process.env.BASE_URL }
  );

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 10
  });
  const loader = new TextLoader('./public/test.vue');
  const docs = await loader.loadAndSplit(splitter);
  // const docs = await loader.load();
  console.log('[docs ]', docs.length);

  // 创建内存向量索引数据库（为了快速演示，只导入前 1 段）
  const embeddings = new OpenAIEmbeddings(
    { openAIApiKey: process.env.OPENAI_KEY },
    { basePath: process.env.BASE_URL }
  );
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  // 查找相似句
  const relevantDocs = await vectorStore.similaritySearch(question);
  // 创建问答链
  const chainQA = loadQARefineChain(chatModel, { verbose: true });

  chainQA.call({ input_documents: relevantDocs, question }, [
    {
      // 接收的回调
      handleLLMNewToken(token) {
        // 回答中
        cb && cb(token);
      },
      // 结束的回调
      handleLLMEnd(output) {
        cb && cb('[DONE]');
      }
    }
  ]);
  cb && cb(question);

  // 创建并执行问答链
  /* const chainQA = VectorDBQAChain.fromLLM(chatModel, vectorStore, {
    // k: 1, //  docs的段落长度
    // returnSourceDocuments: true,
    verbose: true
  });
 */
  // console.log(' server log ====\n', res.output_text, '\n====\n');
}

module.exports = documentEmbedding;
