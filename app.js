const puppeteer = require('puppeteer');

(async () => {
  // 开启有界面的浏览器
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 0,
      height: 0
    }
  });

  // 打开新页面
  const page = await browser.newPage();
  // 跳转地址
  await page.goto('file:///C:/Users/10751/Desktop/tett/index.html');

  // 等待dom加载完成
  await page.waitForSelector('#username');
  // 找到dom
  const $username = await page.$('#username');
  // 输入内容
  $username.type('11111121', { delay: 100 });

  const $btn = await page.$('#btn');
  $btn.click();
})();
