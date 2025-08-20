const knex = require('knex')(require('../config/db-config'));
const normalizer = require('./normalizer');

class DataStorage {
  async init() {
    try {
      console.log('🔄 Checking database tables...');
      
      // Verify database connection first
      await knex.raw('SELECT 1');
      
      const hasTable = await knex.schema.hasTable('datasets');
      
      if (!hasTable) {
        console.log('⚡ Creating datasets table...');
        await knex.schema.createTable('datasets', (table) => {
          table.increments('id').primary();
          table.string('survey_id').notNullable();
          table.integer('year').notNullable();
          table.json('variables').notNullable();
          table.json('metadata');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
          
          // Add indexes for better query performance
          table.index(['survey_id', 'year'], 'survey_year_idx');
        });
        console.log('✅ Created datasets table');
      } else {
        console.log('✅ Datasets table already exists');
      }
      
      // Add version tracking table
      await this._ensureVersionTable();
      
    } catch (error) {
      console.error('❌ Storage initialization failed:');
      console.error('- Error:', error.message);
      if (error.sql) console.error('- SQL:', error.sql);
      throw error; // Rethrow to be caught by app.js
    }
  }

  async _ensureVersionTable() {
    const hasVersionTable = await knex.schema.hasTable('schema_version');
    if (!hasVersionTable) {
      await knex.schema.createTable('schema_version', (table) => {
        table.increments('id').primary();
        table.string('version').notNullable();
        table.timestamp('applied_at').defaultTo(knex.fn.now());
      });
      await knex('schema_version').insert({ version: '1.0.0' });
    }
  }

  async storeDataset(dataset) {
    try {
      if (!normalizer[`normalize${dataset.survey_id}`]) {
        throw new Error(`No normalizer found for survey ID: ${dataset.survey_id}`);
      }

      const normalized = normalizer[`normalize${dataset.survey_id}`](dataset);
      
      // Add conflict handling for duplicate surveys
      const result = await knex('datasets')
        .insert(normalized)
        .onConflict(['survey_id', 'year'])
        .merge();
      
      return {
        success: true,
        id: result[0],
        survey_id: normalized.survey_id,
        year: normalized.year
      };
    } catch (error) {
      console.error('Failed to store dataset:', {
        survey_id: dataset.survey_id,
        error: error.message
      });
      throw error;
    }
  }

  // Add cleanup method for tests
  async _clean() {
    if (process.env.NODE_ENV === 'test') {
      await knex.schema.dropTableIfExists('datasets');
      await knex.schema.dropTableIfExists('schema_version');
    }
  }
}

// Singleton instance
module.exports = new DataStorage();