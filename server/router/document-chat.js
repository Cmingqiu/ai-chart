const express = require('express');
const router = express.Router();
const createDocumentChat = require('../controls/document-chat');

// createDocumentChat('前端');
(async function () {
  router.get('/', async (req, res) => {
    const q = req.query.question;
    console.log('q ==== \n', q);
    res.header({
      'Cache-Control': 'no-cache, no-transform'
      // 'Content-Type': 'text/event-stream',
      // Connection: 'keep-alive'
    });
    const answer = await createDocumentChat(q);
    // const answer = await handle(q);
    res.send(answer);
  });
})();

module.exports = router;
