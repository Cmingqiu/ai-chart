import axios from 'axios';
import { BASE_URL, OPENAI_KEY, OPENAI_MODEL } from '../config/const';

const http = axios.create({
  baseURL: BASE_URL
});
http.interceptors.request.use(
  config => {
    config.headers.Authorization = OPENAI_KEY;
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
http.interceptors.response.use(
  response => {
    return response.data;
  },
  err => {
    return Promise.reject(err);
  }
);

// 查询可用的模型 text-embedding-ada-002、gpt-3.5-turbo、gpt-3.5-turbo-0301
export function fetchModels() {
  return http.get('/models');
}

/**
 *
 * @param {string} prompt
 * @returns
 */
export function postCompletions(data) {
  return http.post('/completions', { ...data, model: OPENAI_MODEL });
}

/**
 * 问答，一次性返回
 * @param {array} messages
 * @param {string}  role : system, user, or assistant.  required
 * system 系统用户，这个时候content里面的内容就代表我们初始给ChatGPT一个指令，告诉ChatGPT应该怎么回答用户的问题。这也就是为什么很多类似的站点第一轮对话都有对应的prompts，其实就是告诉ChatGPT用户想干什么。
  user C端的用户，这个时候content的内容就是用户发送给ChatGPT的。
  assistant 助理，这个时候content的内容就是ChatGPT返回回来的内容。 
 * @param {string}  content required
 * @param {string}  name
 * @returns
 */
export function chatCompletions(data) {
  return http.post('/chat/completions', { ...data, model: OPENAI_MODEL });
}

/**
 * 文本向量化
 * @param {string}  input
 * @returns
 */
export function postEmbeddings(input) {
  return http.post('/embeddings', { input, model: OPENAI_MODEL });
}

export function getApi() {
  const ctl = new AbortController();
  return {
    handler: http.get('api', {
      baseURL: '/',
      timeout: 2000,
      signal: ctl.signal
    }),
    ctl
  };
}
