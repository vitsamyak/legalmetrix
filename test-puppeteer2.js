import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Check if we need to login
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('Logging in...');
      await page.type('input[type="email"]', 'admin@example.com'); // default dummy? Let's check what auth allows
      await page.type('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      console.log('Waiting for network idle...');
      await page.waitForNetworkIdle({ timeout: 5000 }).catch(()=>console.log('networkidle timeout'));
    }
    
    console.log('Going to new inspection...');
    await page.goto('http://localhost:5173/new-inspection', { waitUntil: 'networkidle0' });
    console.log('URL is now:', page.url());
    
    // Evaluate if we are on the page
    const content = await page.content();
    if (content.includes('OCR Extraction Failed')) {
      console.log('FOUND OCR FAILED TEXT!');
      // Find the error details
      const errorText = await page.evaluate(() => {
        const span = document.querySelector('span.text-error.text-xs.font-mono');
        return span ? span.innerText : 'Not found';
      });
      console.log('ERROR DETAILS:', errorText);
    } else {
      console.log('No OCR failure found on initial load. Need to run inspection.');
      // Actually we can't run it easily if we don't have a valid image.
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
