// etl/extract/downloader.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { auth } = require('../config/credentials');
const cheerio = require('cheerio'); // HTML parsing
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

async function downloadDataset(dataset) {
  const tempDir = path.join(__dirname, '..', 'temp', dataset.name);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // 1. Get login page
    const loginPage = await axios.get(
      'https://microdata.gov.in/nada43/index.php/auth/login',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    // 2. Parse CSRF token using Cheerio
    const $ = cheerio.load(loginPage.data);
    const csrfToken = $('input[name="csrf_token"]').val();
    
    if (!csrfToken) {
      // Save the login page HTML for debugging
      await writeFile(path.join(tempDir, 'login_page.html'), loginPage.data);
      throw new Error('CSRF token not found in login page. Saved login page for inspection.');
    }

    // 3. Perform login
    const loginResponse = await axios.post(
      'https://microdata.gov.in/nada43/index.php/auth/login',
      new URLSearchParams({
        username: auth.username,
        password: auth.password,
        csrf_token: csrfToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://microdata.gov.in/nada43/index.php/auth/login'
        },
        maxRedirects: 0,
        validateStatus: (status) => status === 302
      }
    );

    // 4. Verify login success by checking cookies
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      throw new Error('Login failed - no session cookies received');
    }

    // 5. Download dataset
    const filePath = path.join(tempDir, 'raw.csv');
    const response = await axios.get(
      `${dataset.url}/download`,
      {
        headers: {
          'Cookie': cookies.join(';'),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        responseType: 'stream'
      }
    );

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });

  } catch (error) {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    throw new Error(`Download failed: ${error.message}`);
  }
}

module.exports = { downloadDataset };