import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if(msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });
  
  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Check if we need to login
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('Logging in as inspector.delhi@gov.in / password123...');
      // Clear inputs first just in case
      await page.evaluate(() => {
        document.querySelector('input[type="email"]').value = '';
        document.querySelector('input[type="password"]').value = '';
      });
      await page.type('input[type="email"]', 'inspector.delhi@gov.in');
      await page.type('input[type="password"]', 'password123');
      
      console.log('Clicking login...');
      await page.click('button[type="submit"]');
      
      // Wait for navigation to dashboard or check for error
      try {
        console.log('Waiting for authentication...');
        await page.waitForFunction(() => {
           return window.location.pathname === '/dashboard' || document.querySelector('.text-rose-300') !== null;
        }, { timeout: 10000 });
        
        const error = await page.evaluate(() => {
          const el = document.querySelector('.text-rose-300');
          return el ? el.textContent : null;
        });
        
        if (error) {
          console.error('Login Failed with error:', error);
          throw new Error('Login failed');
        }
        
        console.log('Successfully logged in and reached dashboard.');
      } catch(e) {
        console.log('Navigation wait failed or login error:', e.message);
      }
    } else {
      console.log('Already logged in.');
    }
    
    console.log('Navigating to /new-inspection...');
    await page.goto('http://localhost:5173/new-inspection', { waitUntil: 'networkidle0' });
    
    console.log('Step 1: Inspection Info...');
    // Wait for the button
    await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent && b.textContent.includes('Next Step'));
    }, { timeout: 10000 });
    
    const buttons = await page.$$('button');
    for (const btn of buttons) {
       const text = await page.evaluate(el => el.textContent, btn);
       if (text && text.includes('Next Step')) {
          await btn.click();
          break;
       }
    }
    await new Promise(r => setTimeout(r, 1000));

    console.log('Step 2: Product Details...');
    // Fill product name and brand
    const inputs = await page.$$('input[type="text"]');
    for (const input of inputs) {
       const placeholder = await page.evaluate(el => el.getAttribute('placeholder'), input);
       if (placeholder && placeholder.includes('Ashirvaad')) {
          await input.type('Real Test Product');
       } else if (placeholder && placeholder.includes('ITC Limited')) {
          await input.type('Real Test Brand');
       }
    }
    
    // Click next
    for (const btn of await page.$$('button')) {
       const text = await page.evaluate(el => el.textContent, btn);
       if (text && text.includes('Next Step')) {
          await btn.click();
          break;
       }
    }
    await new Promise(r => setTimeout(r, 1000));

    console.log('Step 3: Upload Evidence...');
    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs.length > 0) {
      const realImagePath = path.resolve('real-evidence.jpg');
      console.log(`Uploading file: ${realImagePath} to first input`);
      await fileInputs[0].uploadFile(realImagePath);
    } else {
      console.log("Error: No file inputs found!");
    }
    await new Promise(r => setTimeout(r, 1000));

    // Click Upload & Submit
    console.log('Submitting...');
    let submitted = false;
    for (const btn of await page.$$('button')) {
       const text = await page.evaluate(el => el.textContent, btn);
       if (text && text.includes('Upload & Submit')) {
          await btn.click();
          submitted = true;
          break;
       }
    }
    
    if (!submitted) console.log("Could not find Upload & Submit button");

    console.log('Waiting for AI Processing to complete (can take up to 30s)...');
    
    let resultFinal = 'Unknown';
    for(let i=0; i<30; i++) {
       await new Promise(r => setTimeout(r, 1000));
       const content = await page.content();
       
       if (content.includes('OCR Extraction Failed')) {
           resultFinal = 'OCR_FAIL';
           break;
       }
       if (content.includes('Compliance Analysis Failed')) {
           resultFinal = 'COMPLIANCE_FAIL';
           break;
       }
       if (content.includes('Evidence Secured') || content.includes('Inspection and AI analysis securely completed!')) {
           resultFinal = 'SUCCESS';
           break;
       }
    }

    console.log(`\n--- FINAL E2E RESULT: ${resultFinal} ---\n`);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
