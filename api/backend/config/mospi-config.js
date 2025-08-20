module.exports = {
  // MoSPI API endpoints
  endpoints: {
    catalog: 'https://microdata.gov.in/api/catalog',
    datasets: {
      PLFS: 'https://microdata.gov.in/api/dataset/PLFS',
      HCES: 'https://microdata.gov.in/api/dataset/HCES'
    }
  },
  
  // Rate limiting (requests per minute)
  rateLimit: 30
};