import axios from 'axios';
import { OPENAI_KEY } from '../config/const';

const http = axios.create({ baseURL: '//localhost:3000' });
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

/**
 * 文档问答
 * @param {string} question
 * @returns
 */
export function documentChat(question) {
  return http.get('/document-chat', { params: { question } });
}
