import { fetchEventSource } from '@microsoft/fetch-event-source';
import { OPENAI_KEY, OPENAI_MODEL } from '../config/const';

class RetriableError extends Error {}
class FatalError extends Error {}
const ctrl = new AbortController();

/**
 * 使用SSE流式问答
 * @param {*} messages
 * @param {*} messageCb
 */
export function chat(messages, url, messageCb) {
  fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: OPENAI_KEY
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      stream: true
      // stop: '[DONE]'
    }),
    signal: ctrl.signal,
    onmessage(msg) {
      const { event, data } = msg;
      if (event !== 'FatalError') {
        messageCb && messageCb(data);
      }
    },
    onclose() {
      console.log('‘close');
      ctrl.abort();
    },
    onerror(err) {
      console.log('error');
      ctrl.abort();
    }
  });

  // get
  /* const sse = new EventSource('/stream');
  sse.onmessage = function (e) {
    console.log(e.data);
  };
  sse.onerror = function (err) {
    console.error(err);
  }; */
}

// export function chat(messages) {
//   return new Promise((resolve, reject) => {
//     const controller = new AbortController();
//     fetchEventSource(`${BASE_URL}/chat/completions`, {
//       method: 'post',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: OPENAI_KEY
//       },
//       body: JSON.stringify({
//         model: OPENAI_MODEL,
//         messages,
//         stream: true
//       }),
//       signal: controller.signal,
//       onmessage(msg) {
//         const { event, data } = msg;
//         if (event !== 'FatalError') {
//           console.log('===> ', msg);
//           resolve(msg);
//         }
//       },
//       onclose() {
//         resolve('end');
//       },
//       onerror(err) {
//         reject(err);
//       }
//     });
//   });

//   // get
//   /* const sse = new EventSource('/stream');
//   sse.onmessage = function (e) {
//     console.log(e.data);
//   };
//   sse.onerror = function (err) {
//     console.error(err);
//   }; */
// }
