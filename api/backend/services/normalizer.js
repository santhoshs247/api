class DatasetNormalizer {
  normalizePLFS(data) {
    return {
      survey_id: 'PLFS',
      year: data.year,
      variables: {
        employment_rate: data.employment_rate,
        state: data.state
      },
      metadata: {
        source: 'MoSPI',
        retrieved_at: new Date()
      }
    };
  }

  normalizeHCES(data) {
    return {
      survey_id: 'HCES',
      year: data.year,
      variables: {
        avg_income: data.avg_income,
        household_size: data.hh_size
      },
      metadata: {
        source: 'MoSPI',
        retrieved_at: new Date()
      }
    };
  }
}

module.exports = new DatasetNormalizer();