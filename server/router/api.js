const express = require('express');
const router = express.Router();

// test
router.get('/', async (req, res) => {
  const q = req.query;
  console.log(q);
  res.json({ code: 0 });
  /* try {
    const data = await fetchSerpApi(q);
    res.json({
      code: 0,
      msg: 'success',
      data
    });
  } catch (error) {
    res.status(error.response.status || 503).json({ error });
  } */
});

module.exports = router;
