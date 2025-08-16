import React, { useState } from 'react';
import { Play, Copy, Download, Zap, Code, CheckCircle } from 'lucide-react';

const QueryBuilder = ({ onExecuteQuery, isLoading }) => {
  const [query, setQuery] = useState(`SELECT * FROM survey_responses 
WHERE rating >= 4 
ORDER BY created_at DESC 
LIMIT 10;`);
  
  const [queryType, setQueryType] = useState('custom');

  const predefinedQueries = [
    {
      name: 'High Satisfaction Responses',
      description: 'Responses with rating 4 or above',
      query: `SELECT * FROM survey_responses 
WHERE rating >= 4 
ORDER BY created_at DESC 
LIMIT 10;`
    },
    {
      name: 'Recent Feedback',
      description: 'Last 24 hours responses',
      query: `SELECT * FROM survey_responses 
WHERE created_at >= NOW() - INTERVAL '24 hours' 
ORDER BY created_at DESC;`
    },
    {
      name: 'Category Summary',
      description: 'Response count by category',
      query: `SELECT category, COUNT(*) as count, AVG(rating) as avg_rating 
FROM survey_responses 
WHERE rating IS NOT NULL 
GROUP BY category;`
    },
    {
      name: 'Demographics Analysis',
      description: 'Responses grouped by location',
      query: `SELECT 
  JSON_EXTRACT(demographics, '$.location') as location,
  COUNT(*) as responses,
  AVG(rating) as avg_rating
FROM survey_responses 
WHERE rating IS NOT NULL 
GROUP BY location;`
    }
  ];

  const handleExecuteQuery = () => {
    if (query.trim()) {
      onExecuteQuery(query);
    }
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const handlePredefinedQuery = (selectedQuery) => {
    setQuery(selectedQuery.query);
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Code className="w-6 h-6 mr-2 text-indigo-400" />
          SQL Query Builder
        </h2>
        
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setQueryType('custom')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              queryType === 'custom'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Custom Query
          </button>
          <button
            onClick={() => setQueryType('predefined')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              queryType === 'predefined'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Quick Queries
          </button>
        </div>

        {queryType === 'predefined' && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Predefined Queries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predefinedQueries.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedQuery(item)}
                  className="text-left p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-sm text-white/60 mt-1">{item.description}</p>
                    </div>
                    <Zap className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-40 bg-slate-900/50 border border-white/20 rounded-lg p-4 text-white font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your SQL query here..."
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={handleCopyQuery}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                title="Copy Query"
              >
                <Copy className="w-4 h-4 text-white/60 group-hover:text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExecuteQuery}
                disabled={isLoading || !query.trim()}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Executing...' : 'Execute Query'}
              </button>

              <button
                className="flex items-center px-4 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 border border-white/20"
                title="Download Query"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center text-emerald-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>SQL Valid</span>
              </div>
              <span className="text-white/40">|</span>
              <span className="text-white/60">
                {query.length} characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryBuilder;