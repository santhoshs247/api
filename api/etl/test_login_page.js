const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://microdata.gov.in/nada43/index.php/auth/login', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Save full page screenshot
  await page.screenshot({ path: 'login_page.png', fullPage: true });

  // Analyze form elements
  const formAnalysis = await page.evaluate(() => {
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.map(form => ({
      id: form.id,
      action: form.action,
      inputs: Array.from(form.querySelectorAll('input')).map(input => ({
        name: input.name,
        type: input.type,
        id: input.id,
        placeholder: input.placeholder
      })),
      buttons: Array.from(form.querySelectorAll('button, input[type="submit"]')).map(btn => ({
        type: btn.type,
        text: btn.textContent.trim(),
        id: btn.id
      }))
    }));
  });

  console.log('Form Analysis:', JSON.stringify(formAnalysis, null, 2));
  fs.writeFileSync('form_analysis.json', JSON.stringify(formAnalysis, null, 2));

  await browser.close();
})();