const axios = require('axios');
const config = require('../config/mospi-config');

class DatasetFetcher {
  constructor() {
    this.client = axios.create({
      baseURL: config.endpoints.catalog,
      timeout: 30000
    });
  }

  async fetchDataset(datasetId) {
    try {
      const { data } = await this.client.get(`/dataset/${datasetId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${datasetId}:`, error.message);
      return null;
    }
  }

  async fetchAll() {
    const datasets = Object.keys(config.endpoints.datasets);
    return Promise.all(datasets.map(id => this.fetchDataset(id)));
  }
}

module.exports = new DatasetFetcher();