import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Check if we need to login
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('Logging in...');
      await page.type('input[type="email"]', 'test@example.com'); // Replace with actual test email if needed
      await page.type('input[type="password"]', 'password123'); // Replace
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    await page.goto('http://localhost:5173/new-inspection', { waitUntil: 'networkidle0' });
    
    console.log('On New Inspection page');
    
    // We would need to fill the form here but it might be complex.
    // Instead, let's just observe network requests to the edge function.
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
