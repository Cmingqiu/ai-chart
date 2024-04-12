const express = require('express');
const router = express.Router();
const createDocumentEmbedding = require('../controls/document-embedding');

/* createDocumentEmbedding(
  '假设你是一名专业的前端开发人员，这是一份vue文件，你觉得有什么问题，以列表方式指出来',
  msg => {
    if (msg === '[DONE]') console.log('DONE');
    else console.log(msg);
  }
); */

router.post('/', (req, res) => {
  const question = req.body.messages;
  res.header({
    'Cache-Control': 'no-cache, no-transform',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive'
  });
  createDocumentEmbedding(question, msg => {
    if (msg === '[DONE]') res.write('data: [DONE]\n\n');
    else res.write(`data: ${msg}\n\n`);
  });
});

module.exports = router;
