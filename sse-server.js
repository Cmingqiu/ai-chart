var http = require('http');

http
  .createServer(function (req, res) {
    var fileName = req.url;
    console.log(fileName);
    if (fileName === '/api') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('data: ' + new Date() + '\n\n');
    }
  })
  .listen(8844, '127.0.0.1');

/* http
  .createServer(function (req, res) {
    var fileName = req.url;
    console.log(fileName);
    if (fileName === '/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write('retry: 10000\n');
      res.write('event: connecttime\n');
      res.write('data: ' + new Date() + '\n\n');

      interval = setInterval(function () {
        res.write('data: ' + new Date() + '\n\n');
      }, 1000);

      req.connection.addListener(
        'close',
        function () {
          clearInterval(interval);
        },
        false
      );
    }
  })
  .listen(8844, '127.0.0.1'); */
