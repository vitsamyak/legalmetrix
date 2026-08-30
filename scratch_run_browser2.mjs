import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen to network requests
  page.on('response', async (response) => {
    if (response.url().includes('process-compliance')) {
      console.log('--- NETWORK RESPONSE ---');
      console.log('URL:', response.url());
      console.log('Status:', response.status());
      try {
        const text = await response.text();
        console.log('Body:', text);
      } catch (e) {
        console.log('Body: Could not read');
      }
      console.log('------------------------');
    }
  });

  page.on('console', msg => {
    if (msg.text().includes('Function error') || msg.text().includes('Edge Function Invocation') || msg.text().includes('AI Analysis')) {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  console.log('Navigating...');
  await page.goto('http://localhost:5173');
  
  console.log('Waiting for Sign In...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', 'testinspector_1787903454466@legalmetrix.com');
  await page.type('input[type="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for Dashboard...');
  await page.waitForSelector('h1', { text: 'Dashboard', timeout: 10000 }).catch(()=>null);
  await new Promise(r => setTimeout(r, 2000));

  console.log('Going to New Inspection...');
  await page.goto('http://localhost:5173/inspections/new');
  
  console.log('Filling step 1...');
  await page.waitForSelector('button');
  const nextButtons = await page.$$('button');
  for (const btn of nextButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Next Step') {
      await btn.click();
      break;
    }
  }

  console.log('Filling step 2...');
  await page.waitForSelector('input[placeholder="e.g. Ashirvaad Whole Wheat Atta 5kg"]');
  const inputs = await page.$$('input[type="text"]');
  await inputs[0].type('Puppeteer Test');
  await inputs[1].type('Browser Brand');
  
  const nextButtons2 = await page.$$('button');
  for (const btn of nextButtons2) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Next Step') {
      await btn.click();
      break;
    }
  }

  console.log('Filling step 3 (Evidence)...');
  const b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  fs.writeFileSync('test_browser.jpg', Buffer.from(b64, 'base64'));
  
  await page.waitForSelector('input[type="file"]');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile('test_browser.jpg');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Submitting...');
  const submitButtons = await page.$$('button');
  for (const btn of submitButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Upload & Submit') {
      await btn.click();
      break;
    }
  }

  console.log('Waiting for AI Processing...');
  await new Promise(r => setTimeout(r, 15000));
  
  const finalHtml = await page.content();
  if (finalHtml.includes('Evidence Secured')) {
    console.log('SUCCESS! Reached Result screen.');
  } else {
    console.log('FAILED to reach result screen. Error remains.');
  }

  await browser.close();
})();
