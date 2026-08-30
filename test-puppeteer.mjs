import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // 1. Go to signup page
  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });
  
  // 2. Click sign up tab if exists (assuming it's a standard auth page)
  console.log("Navigated to auth page");
  
  // If the page redirects to dashboard immediately, we are already logged in (unlikely)
  if (page.url().includes('dashboard')) {
      console.log("Already logged in");
  } else {
      console.log("Current URL:", page.url());
      // Let's dump the HTML to see what the auth form looks like
      const html = await page.content();
      console.log("HTML length:", html.length);
      // Wait for email input
      await page.waitForSelector('input[type="email"]', {timeout: 5000}).catch(()=>console.log("No email input"));
  }
  
  await browser.close();
})();
