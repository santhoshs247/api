import React from 'react';
import { Download, Copy, BarChart3 } from 'lucide-react';

const ResultsDisplay = ({ results, isLoading }) => {
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query_results.json';
    link.click();
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-8 border border-white/20 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-white/70 font-medium">Executing query...</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-emerald-400" />
            Query Results
          </h3>
          <p className="text-white/60 mt-1">
            {results.length} {results.length === 1 ? 'record' : 'records'} returned
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyJSON}
            className="flex items-center px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
            title="Copy as JSON"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* JSON Output */}
      <pre className="bg-black/50 p-4 rounded-lg text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
};

export default ResultsDisplay;
