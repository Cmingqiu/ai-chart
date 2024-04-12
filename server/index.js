const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const resolve = p => path.resolve(__dirname, p);
dotenv.config({ path: '../.env' });

const documentChat = require('./router/document-chat');
const docEmbedding = require('./router/document-embedding');
// const docRefine = require('./components/document-refine');

const app = express();

app.use(express.json());
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method.toLowerCase() == 'options') res.sendStatus(200);
  else next();
});

// 文档问答
app.use('/document-chat', documentChat);
app.use('/document-embedding', docEmbedding);

app.listen(3000, () => console.log('server is listening on port 3000！'));

// const embedding = require('./components/embedding');
// embedding('作者是谁');
