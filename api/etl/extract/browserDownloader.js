const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { auth } = require('../config/credentials');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');

// Add stealth plugin
puppeteer.use(StealthPlugin());

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Create interface for manual input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptUser(message) {
  return new Promise(resolve => {
    rl.question(message, answer => {
      resolve(answer.trim());
    });
  });
}

async function handleCaptcha(page, tempDir) {
  console.log('\n=== CAPTCHA DETECTED ===');
  
  // 1. Locate CAPTCHA elements
  const captchaInfo = await page.evaluate(() => {
    const captchaLabel = Array.from(document.querySelectorAll('label'))
      .find(el => el.textContent.match(/Security code|CAPTCHA/i));
    
    const captchaImage = document.querySelector('#captcha-image');
    const captchaInput = document.querySelector('#captcha');
    
    return {
      labelText: captchaLabel?.textContent.trim(),
      imageSrc: captchaImage?.src,
      inputExists: !!captchaInput
    };
  });

  if (!captchaInfo.inputExists) {
    throw new Error('CAPTCHA detected but could not find input field');
  }

  // 2. Save CAPTCHA image for reference
  let captchaImagePath = '';
  if (captchaInfo.imageSrc) {
    captchaImagePath = path.join(tempDir, 'captcha.png');
    const viewSource = await page.goto(captchaInfo.imageSrc);
    await writeFile(captchaImagePath, await viewSource.buffer());
    console.log(`CAPTCHA image saved to: ${captchaImagePath}`);
  }

  // 3. Display instructions to user
  console.log('\n=== MANUAL CAPTCHA SOLUTION REQUIRED ===');
  console.log(`CAPTCHA Prompt: ${captchaInfo.labelText || 'Enter the security code shown'}`);
  
  if (captchaImagePath) {
    console.log(`CAPTCHA image saved to: ${captchaImagePath}`);
    console.log('Open this image to view the CAPTCHA text');
  }

  // 4. Get CAPTCHA solution from user
  const captchaSolution = await promptUser('Enter the CAPTCHA text: ');

  // 5. Input the solution
  await page.type('#captcha', captchaSolution, { delay: 30 });
  await page.screenshot({ path: path.join(tempDir, 'captcha_filled.png') });

  return captchaSolution;
}

async function downloadDataset(dataset) {
  const tempDir = path.join(__dirname, '..', 'temp', dataset.name);
  await mkdir(tempDir, { recursive: true });

  let browser;
  let page;
  let loginAttempts = 0;
  const maxLoginAttempts = 3;

  try {
    // Launch browser with visible window
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1200,800'
      ],
      defaultViewport: null,
      timeout: 120000
    });

    page = await browser.newPage();
    
    // Configure browser to look more human
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Navigate to login page
    console.log('Navigating to MoSPI portal...');
    await page.goto('https://microdata.gov.in/nada43/index.php', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Save initial state
    await page.screenshot({ path: path.join(tempDir, '1_initial_page.png') });

    // Click the Login link in navigation
    console.log('Clicking login link...');
    const loginLink = await page.waitForSelector('a:contains("Login")', { timeout: 10000 });
    await loginLink.click();

    // Wait for login form to appear
    await page.waitForSelector('#login-form', { timeout: 10000 });
    await page.screenshot({ path: path.join(tempDir, '2_login_form.png') });

    // Login retry loop
    let loginSuccess = false;
    
    while (loginAttempts < maxLoginAttempts && !loginSuccess) {
      loginAttempts++;
      console.log(`\nLogin attempt ${loginAttempts} of ${maxLoginAttempts}`);

      try {
        // Fill login form with NADA-specific selectors
        await page.type('#email', auth.username, { delay: 50 });
        await page.type('#password', auth.password, { delay: 50 });
        
        // Handle CAPTCHA if present
        const captchaExists = await page.evaluate(() => {
          return !!document.querySelector('#captcha');
        });

        if (captchaExists) {
          await handleCaptcha(page, tempDir);
        }

        // Click login button
        await page.click('#login-form button[type="submit"]');
        
        // Wait for navigation or error
        await Promise.race([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
          page.waitForSelector('.alert-danger', { timeout: 30000 })
        ]);

        // Check for login errors
        const loginError = await page.evaluate(() => {
          const errorElement = document.querySelector('.alert-danger');
          return errorElement ? errorElement.textContent.trim() : null;
        });

        if (loginError) {
          if (loginError.includes('Captcha') && loginAttempts < maxLoginAttempts) {
            console.log(`\nCAPTCHA Error: ${loginError}`);
            console.log('Retrying with new CAPTCHA...');
            
            // Reload page for new CAPTCHA
            await page.goto('https://microdata.gov.in/nada43/index.php', {
              waitUntil: 'networkidle2',
              timeout: 60000
            });
            const retryLoginLink = await page.waitForSelector('a:contains("Login")', { timeout: 10000 });
            await retryLoginLink.click();
            await page.waitForSelector('#login-form', { timeout: 10000 });
            continue;
          }
          throw new Error(loginError);
        }

        loginSuccess = true;
        console.log('Login successful!');

      } catch (error) {
        if (loginAttempts >= maxLoginAttempts) {
          throw error;
        }
        console.log(`Login attempt failed: ${error.message}`);
        console.log('Retrying...');
      }
    }

    if (!loginSuccess) {
      throw new Error(`Failed to login after ${maxLoginAttempts} attempts`);
    }

    // Navigate to dataset page
    console.log(`Navigating to dataset page: ${dataset.url}`);
    await page.goto(dataset.url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await page.screenshot({ path: path.join(tempDir, '3_dataset_page.png') });

    // Find and click download button
    console.log('Looking for download options...');
    const downloadButton = await page.waitForSelector(
      'a:contains("Download"), button:contains("Download"), a.download, button.download', 
      { timeout: 30000 }
    );
    
    // Get download URL
    const downloadUrl = await page.evaluate(button => {
      return button.href || button.dataset.url || button.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
    }, downloadButton);
    
    console.log(`Found download URL: ${downloadUrl}`);

    // Download the file
    console.log('Starting download...');
    const filePath = path.join(tempDir, `${dataset.name}.csv`);
    const viewSource = await page.goto(downloadUrl);
    await writeFile(filePath, await viewSource.buffer());

    console.log('\n=== COMPLETED SUCCESSFULLY ===');
    console.log(`File saved to: ${filePath}`);
    console.log('\nBrowser will remain open for inspection...');

    return filePath;

  } catch (error) {
    // Save screenshot for debugging
    const screenshotPath = path.join(tempDir, 'error.png');
    if (page) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    console.error('\n=== ERROR OCCURRED ===');
    console.error(error.message);
    console.log('Browser remains open for debugging...');
    if (screenshotPath) {
      console.log(`Screenshot saved to: ${screenshotPath}`);
    }

    throw error;
  } finally {
    rl.close();
    // Keep browser open for debugging
    // await browser.close();
  }
}

module.exports = { downloadDataset };