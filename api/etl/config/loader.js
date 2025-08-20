// etl/config/loader.js
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const configPath = path.join(__dirname, 'mospi.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

module.exports = config;