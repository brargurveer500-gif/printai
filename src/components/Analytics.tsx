import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Printer, 
  DollarSign, 
  Clock, 
  RotateCcw, 
  Calendar,
  Sparkles,
  PieChart
} from 'lucide-react';
import { AnalyticsData } from '../types';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'orders' | 'pages' | 'revenue'>('revenue');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 animate-bounce" />
        <p>Loading analytics and metrics...</p>
      </div>
    );
  }

  // Max value calculation for SVG chart height
  const maxChartVal = Math.max(...data.dailyStats.map(d => d[activeMetric]), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Operational Analytics & Volume</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry on print spool volume, paper substrate consumption, turn-around times, and revenue.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors self-start sm:self-auto"
          title="Refresh analytics data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Print Jobs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">{data.totalOrders}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Active spool queue</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Pages Printed</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">{data.totalPagesPrinted}</p>
          <p className="text-xs text-slate-400 mt-1">All processed sheets</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">${data.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">Billed orders</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg Turnaround</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">{data.avgTurnaroundMinutes}m</p>
          <p className="text-xs text-slate-400 mt-1">From submit to ready</p>
        </div>
      </div>

      {/* 7-Day Trend Chart Card */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Daily Print Activity Trend</h3>
            <p className="text-xs text-slate-400">Daily breakdown over the past 7 operating days</p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMetric === 'revenue' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setActiveMetric('orders')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMetric === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Orders Count
            </button>
            <button
              onClick={() => setActiveMetric('pages')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMetric === 'pages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pages Printed
            </button>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-6 pb-2 border-b border-slate-800/80">
          {data.dailyStats.map((stat, idx) => {
            const val = stat[activeMetric];
            const heightPercent = Math.max(12, Math.round((val / maxChartVal) * 100));

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activeMetric === 'revenue' ? `$${val.toFixed(0)}` : val}
                </span>
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-md group-hover:scale-105"
                />
                <span className="text-xs font-semibold text-slate-300 mt-2">{stat.dayName}</span>
                <span className="text-[10px] text-slate-500">{stat.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substrate & Profile Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paper Sizes */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Paper Size Demand
          </h3>
          <div className="space-y-3">
            {data.paperSizeDistribution.map((item) => (
              <div key={item.size} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{item.size} Paper</span>
                  <span className="text-slate-400 font-mono">{item.count} jobs ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Mode */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Color vs B&W Share
          </h3>
          <div className="space-y-3">
            {data.colorModeDistribution.map((item) => (
              <div key={item.mode} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs items-center">
                  <span className="font-bold text-white">{item.mode}</span>
                  <span className="font-mono text-emerald-400 font-bold">${item.revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{item.count} orders</span>
                  <span>{item.percentage}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Level */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Queue Priority Breakdown
          </h3>
          <div className="space-y-3">
            {data.priorityDistribution.map((item) => (
              <div key={item.priority} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold capitalize text-white">{item.priority} Priority</span>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {item.count} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
