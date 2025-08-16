import React, { useState } from 'react';
import { History, Play, Copy, Trash2, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

const QueryHistory = ({ history, onRerunQuery }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyQuery = async (query) => {
    try {
      await navigator.clipboard.writeText(query);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/10';
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      default:
        return 'border-amber-500/20 bg-amber-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <History className="w-7 h-7 mr-3 text-purple-400" />
              Query History
            </h2>
            <p className="text-white/60">Review and manage your query execution history</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-12 border border-white/20 text-center">
          <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No Matching Queries' : 'No Query History'}
          </h3>
          <p className="text-white/50">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Execute your first query to see it appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const { date, time } = formatTimestamp(item.timestamp);
            
            return (
              <div
                key={item.id}
                className={`backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 ${getStatusColor(item.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center space-x-2 mr-4">
                        {getStatusIcon(item.status)}
                        <span className="text-white/80 font-medium capitalize">{item.status}</span>
                      </div>
                      <div className="flex items-center text-white/50 text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{date} at {time}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                      <pre className="text-white/90 text-sm font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                        {item.query}
                      </pre>
                    </div>

                    {item.error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-300 text-sm">
                          <strong>Error:</strong> {item.error}
                        </p>
                      </div>
                    )}

                    {item.results && (
                      <div className="text-white/60 text-sm">
                        <span className="font-medium">Results:</span> {item.results.length} records returned
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onRerunQuery(item.query)}
                      className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 group"
                      title="Re-run Query"
                    >
                      <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => handleCopyQuery(item.query)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 group"
                      title="Copy Query"
                    >
                      <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      className="p-2 bg-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white hover:text-red-300 rounded-lg transition-all duration-200 group"
                      title="Delete from History"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">History Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white">{history.length}</div>
              <div className="text-white/60 text-sm">Total Queries</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-emerald-400">
                {history.filter(h => h.status === 'success').length}
              </div>
              <div className="text-white/60 text-sm">Successful</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {history.filter(h => h.status === 'error').length}
              </div>
              <div className="text-white/60 text-sm">Failed</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-indigo-400">
                {((history.filter(h => h.status === 'success').length / history.length) * 100).toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryHistory;