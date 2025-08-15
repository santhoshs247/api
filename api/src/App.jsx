import React, { useState, useEffect } from 'react';
import { Database, Search, BarChart3, History, Settings, Play, Download, Filter, Users, TrendingUp, Calendar, Eye } from 'lucide-react';
import QueryBuilder from './components/QueryBuilder';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './components/Dashboard';
import DataVisualization from './components/DataVisualization';
import QueryHistory from './components/QueryHistory';

// Mock survey data
const mockSurveyData = [
  {
    id: 1,
    survey_name: "Customer Satisfaction Q4 2024",
    respondent_id: "R001",
    question: "How satisfied are you with our service?",
    answer: "Very Satisfied",
    rating: 5,
    category: "satisfaction",
    created_at: "2024-12-01T10:00:00Z",
    demographics: { age: 28, location: "New York", gender: "Female" }
  },
  {
    id: 2,
    survey_name: "Product Feedback Survey",
    respondent_id: "R002",
    question: "Would you recommend our product?",
    answer: "Yes",
    rating: 4,
    category: "recommendation",
    created_at: "2024-12-02T14:30:00Z",
    demographics: { age: 35, location: "California", gender: "Male" }
  },
  {
    id: 3,
    survey_name: "Employee Engagement 2024",
    respondent_id: "R003",
    question: "How engaged do you feel at work?",
    answer: "Highly Engaged",
    rating: 5,
    category: "engagement",
    created_at: "2024-12-03T09:15:00Z",
    demographics: { age: 42, location: "Texas", gender: "Female" }
  },
  {
    id: 4,
    survey_name: "Customer Satisfaction Q4 2024",
    respondent_id: "R004",
    question: "How would you rate our support team?",
    answer: "Excellent",
    rating: 5,
    category: "support",
    created_at: "2024-12-01T16:45:00Z",
    demographics: { age: 31, location: "Florida", gender: "Male" }
  },
  {
    id: 5,
    survey_name: "Product Feedback Survey",
    respondent_id: "R005",
    question: "What features would you like to see added?",
    answer: "Mobile app integration",
    rating: null,
    category: "features",
    created_at: "2024-12-02T11:20:00Z",
    demographics: { age: 26, location: "Washington", gender: "Non-binary" }
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, description: 'Overview and analytics' },
    { id: 'query', name: 'Query Builder', icon: Database, description: 'Build and execute SQL queries' },
    { id: 'visualization', name: 'Data Viz', icon: TrendingUp, description: 'Interactive charts and graphs' },
    { id: 'history', name: 'History', icon: History, description: 'Query execution history' }
  ];

  // Simulate SQL query execution
  const executeQuery = async (query) => {
    setIsLoading(true);
    
    // Add to history
    const historyEntry = {
      id: Date.now(),
      query,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    setQueryHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple query parsing for demo
    let results = [...mockSurveyData];
    
    if (query.toLowerCase().includes('where')) {
      // Simple filtering simulation
      if (query.toLowerCase().includes('rating >= 4')) {
        results = results.filter(item => item.rating >= 4);
      }
      if (query.toLowerCase().includes('satisfaction')) {
        results = results.filter(item => item.category === 'satisfaction');
      }
    }
    
    if (query.toLowerCase().includes('limit')) {
      const limitMatch = query.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        results = results.slice(0, parseInt(limitMatch[1]));
      }
    }
    
    setQueryResults(results);
    setIsLoading(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={mockSurveyData} />;
      case 'query':
        return (
          <div className="space-y-6">
            <QueryBuilder onExecuteQuery={executeQuery} isLoading={isLoading} />
            <ResultsDisplay results={queryResults} isLoading={isLoading} />
          </div>
        );
      case 'visualization':
        return <DataVisualization data={mockSurveyData} />;
      case 'history':
        return <QueryHistory history={queryHistory} onRerunQuery={executeQuery} />;
      default:
        return <Dashboard data={mockSurveyData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.1%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Survey Data Gateway</h1>
                <p className="text-xs text-purple-200">Advanced SQL Query Interface</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 space-y-2">
            <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Navigation</h3>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`} />
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-60">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Total Records</span>
                  <span className="text-white font-semibold">{mockSurveyData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Surveys</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Avg Rating</span>
                  <span className="text-white font-semibold">4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;