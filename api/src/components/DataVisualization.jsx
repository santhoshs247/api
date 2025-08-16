import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Map, Users, Calendar, Filter, Download } from 'lucide-react';

const DataVisualization = ({ data }) => {
  const [activeChart, setActiveChart] = useState('ratings');
  const [timeFilter, setTimeFilter] = useState('all');

  const processRatingData = () => {
    const ratingCounts = data.filter(d => d.rating).reduce((acc, d) => {
      acc[d.rating] = (acc[d.rating] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: `${rating} Stars`,
      count,
      percentage: ((count / data.filter(d => d.rating).length) * 100).toFixed(1)
    }));
  };

  const processCategoryData = () => {
    const categoryData = data.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(categoryData).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));
  };

  const processLocationData = () => {
    const locationData = data.reduce((acc, d) => {
      const location = d.demographics?.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(locationData).map(([location, count]) => ({
      location,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));
  };

  const processTimelineData = () => {
    const timelineData = data.reduce((acc, d) => {
      const date = new Date(d.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(timelineData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartConfigs = {
    ratings: {
      title: 'Rating Distribution',
      icon: BarChart3,
      data: processRatingData(),
      color: 'indigo'
    },
    categories: {
      title: 'Response Categories',
      icon: PieChart,
      data: processCategoryData(),
      color: 'emerald'
    },
    locations: {
      title: 'Geographic Distribution',
      icon: Map,
      data: processLocationData(),
      color: 'amber'
    },
    timeline: {
      title: 'Response Timeline',
      icon: TrendingUp,
      data: processTimelineData(),
      color: 'rose'
    }
  };

  const BarChart = ({ data, color }) => {
    const maxCount = Math.max(...data.map(d => d.count || 0));
    const colorClasses = {
      indigo: 'from-indigo-500 to-purple-600',
      emerald: 'from-emerald-500 to-teal-600',
      amber: 'from-amber-500 to-orange-600',
      rose: 'from-rose-500 to-pink-600'
    };

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const width = (item.count / maxCount) * 100;
          const label = item.rating || item.category || item.location || item.date;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium">{label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{item.count}</span>
                  {item.percentage && (
                    <span className="text-white/50 text-sm">({item.percentage}%)</span>
                  )}
                </div>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
                  style={{ 
                    width: `${width}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const DonutChart = ({ data, color }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let cumulativePercentage = 0;
    
    const colorClasses = {
      indigo: ['#6366F1', '#8B5CF6', '#A855F7'],
      emerald: ['#10B981', '#14B8A6', '#06B6D4'],
      amber: ['#F59E0B', '#F97316', '#EF4444'],
      rose: ['#F43F5E', '#EC4899', '#D946EF']
    };

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const strokeDasharray = `${(percentage / 100) * 502.65} 502.65`;
              const strokeDashoffset = -cumulativePercentage * 5.0265;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={colorClasses[color][index % 3]}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-white/60 text-sm">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: colorClasses[color][index % 3] }}
              />
              <div className="flex-1">
                <div className="text-white font-medium">
                  {item.category || item.location || item.rating}
                </div>
                <div className="text-white/60 text-sm">
                  {item.count} responses ({item.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const currentChart = chartConfigs[activeChart];
  const Icon = currentChart.icon;

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <TrendingUp className="w-7 h-7 mr-3 text-emerald-400" />
              Data Visualization
            </h2>
            <p className="text-white/60">Interactive charts and analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <button className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(chartConfigs).map(([key, config]) => {
          const ChartIcon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                activeChart === key
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg'
                  : 'backdrop-blur-xl bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              <ChartIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{config.title}</div>
            </button>
          );
        })}
      </div>

      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Icon className="w-6 h-6 mr-3 text-indigo-400" />
            {currentChart.title}
          </h3>
          
          <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-white/70 text-sm">
              {currentChart.data.reduce((sum, item) => sum + (item.count || 0), 0)} responses
            </span>
          </div>
        </div>

        <div className="min-h-[400px] flex items-center justify-center">
          {activeChart === 'categories' || activeChart === 'locations' ? (
            <DonutChart data={currentChart.data} color={currentChart.color} />
          ) : (
            <div className="w-full max-w-4xl">
              <BarChart data={currentChart.data} color={currentChart.color} />
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DataVisualization;