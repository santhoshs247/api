import React from 'react';
import { Users, TrendingUp, Star, Calendar, BarChart3, PieChart, Activity, Target } from 'lucide-react';

const Dashboard = ({ data }) => {
  const calculateStats = () => {
    const totalResponses = data.length;
    const avgRating = data.filter(d => d.rating).reduce((sum, d) => sum + d.rating, 0) / data.filter(d => d.rating).length;
    const categories = [...new Set(data.map(d => d.category))];
    const surveys = [...new Set(data.map(d => d.survey_name))];
    
    const ratingDistribution = data.filter(d => d.rating).reduce((acc, d) => {
      acc[d.rating] = (acc[d.rating] || 0) + 1;
      return acc;
    }, {});

    const categoryStats = categories.map(cat => ({
      name: cat,
      count: data.filter(d => d.category === cat).length,
      avgRating: data.filter(d => d.category === cat && d.rating).reduce((sum, d) => sum + d.rating, 0) / data.filter(d => d.category === cat && d.rating).length || 0
    }));

    return {
      totalResponses,
      avgRating: avgRating.toFixed(1),
      totalSurveys: surveys.length,
      categories: categories.length,
      ratingDistribution,
      categoryStats
    };
  };

  const stats = calculateStats();

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
    const colorClasses = {
      indigo: 'from-indigo-500 to-purple-600',
      emerald: 'from-emerald-500 to-teal-600',
      amber: 'from-amber-500 to-orange-600',
      rose: 'from-rose-500 to-pink-600'
    };

    return (
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, children, icon: Icon }) => (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <Icon className="w-6 h-6 text-indigo-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Survey Analytics Dashboard</h2>
            <p className="text-white/60">Real-time insights from your survey data</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 rounded-lg">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 font-medium">Live Data</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Responses"
          value={stats.totalResponses}
          subtitle="All time"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Average Rating"
          value={stats.avgRating}
          subtitle="out of 5.0"
          icon={Star}
          color="emerald"
        />
        <StatCard
          title="Active Surveys"
          value={stats.totalSurveys}
          subtitle="Currently running"
          icon={Target}
          color="amber"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          subtitle="Different types"
          icon={BarChart3}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Rating Distribution" icon={BarChart3}>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = ((count / stats.totalResponses) * 100).toFixed(1);
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-white/70 text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-amber-400 ml-1" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-white/80 text-sm font-medium">{count}</span>
                    <span className="text-white/50 text-xs ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Category Performance" icon={PieChart}>
          <div className="space-y-4">
            {stats.categoryStats.map((category, index) => {
              const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
              const bgColor = colors[index % colors.length];
              
              return (
                <div key={category.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${bgColor} mr-3`} />
                    <div>
                      <p className="text-white font-medium capitalize">{category.name}</p>
                      <p className="text-white/50 text-sm">{category.count} responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{category.avgRating.toFixed(1)}</p>
                    <p className="text-white/50 text-sm">avg rating</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Recent Survey Activity" icon={Calendar}>
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-medium text-sm">{item.respondent_id}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{item.survey_name}</p>
                  <p className="text-white/60 text-sm">{item.question.substring(0, 60)}...</p>
                </div>
              </div>
              <div className="text-right">
                {item.rating && (
                  <div className="flex items-center justify-end mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? 'text-amber-400 fill-current' : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <p className="text-white/50 text-sm">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

export default Dashboard;