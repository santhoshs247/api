import React from 'react';
import { Loader2, Table, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

const ResultDisplay = ({ results, error, isLoading }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800/60 rounded-lg border border-white/10">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-white/70">Executing query...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <div>
          <h4 className="text-red-400 font-semibold">Query Error</h4>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!results || results.length === 0) {
    return (
      <div className="p-6 bg-slate-800/60 border border-white/10 rounded-lg flex flex-col items-center">
        <FileText className="w-8 h-8 text-white/40 mb-2" />
        <p className="text-white/60">No results to display</p>
      </div>
    );
  }

  // Extract table headers from first row
  const headers = Object.keys(results[0]);

  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 border-b border-white/10 flex items-center space-x-2">
        <Table className="w-5 h-5 text-indigo-400" />
        <h3 className="text-white font-semibold">Query Results</h3>
      </div>
      
      <div className="overflow-x-auto max-h-[400px]">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-slate-900/40">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {results.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition">
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-4 py-2 whitespace-nowrap text-sm text-white/90"
                  >
                    {String(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with result count */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between text-sm text-white/60">
        <span className="flex items-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1" />
          {results.length} rows returned
        </span>
      </div>
    </div>
  );
};

export default ResultDisplay;
