const express = require('express');
const router = express.Router();
const createDocumentRefine = require('../controls/document-refine');

(async function () {
  router.get('/', async (req, res) => {
    res.header({
      'Cache-Control': 'no-cache, no-transform'
      // 'Content-Type': 'text/event-stream',
      // Connection: 'keep-alive'
    });
    const answer = await createDocumentRefine();
    res.send(answer);
  });
})();

module.exports = router;
