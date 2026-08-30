import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  // Wait for login or dashboard
  await new Promise(r => setTimeout(r, 2000));
  const html = await page.content();
  console.log(html.substring(0, 500));
  await browser.close();
})();
