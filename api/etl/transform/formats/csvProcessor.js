// etl/formats/csvProcessor.js
const csv = require('csv-parser');
const fs = require('fs');

function transformValue(value, field) {
  if (value === null || value === undefined) {
    if (field.required) throw new Error(`Missing required field: ${field.name}`);
    return null;
  }

  const strValue = String(value).trim();
  
  switch(field.type) {
    case 'string':
      return strValue;
    case 'number':
      const num = Number(strValue);
      return isNaN(num) ? null : num;
    case 'enum':
      return field.values.includes(strValue) ? strValue : null;
    default:
      return strValue;
  }
}

function process(filePath, schema) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const record = {};
          schema.forEach(field => {
            record[field.name] = transformValue(data[field.name], field);
          });
          results.push(record);
        } catch (error) {
          reject(error);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = { process };