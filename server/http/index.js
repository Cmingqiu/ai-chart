// 使用http模块发送请求

// 使用axios发送请求
const axios = require('axios');

function fetchSerpApi(query = 'hangzhou+current+temperature') {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://serpapi.com/search?location=Austin%2CTexas%2CUnited+States&hl=en&gl=us&q=${query}`
      )
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = { fetchSerpApi };
