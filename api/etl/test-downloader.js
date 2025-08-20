// test-download.js
const { downloadDataset } = require('./etl/extract/browserDownloader');

downloadDataset({
  name: 'PLFS',
  url: 'https://microdata.gov.in/nada43/index.php/catalog/PLFS'
})
.then(file => console.log('Downloaded to:', file))
.catch(err => console.error('Failed:', err));