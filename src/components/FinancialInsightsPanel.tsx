import React, { useState, useMemo } from 'react';
import { Expense, Invoice } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingDown, PieChart as PieIcon, BarChart3, Filter, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, Wrench, Droplets, Zap, Sparkles } from 'lucide-react';

interface FinancialInsightsPanelProps {
  expenses: Expense[];
  invoices?: Invoice[];
  isDark?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Security': '#6366f1',
  'Elevator Maintenance': '#3b82f6',
  'Water Supply': '#06b6d4',
  'Electricity': '#eab308',
  'Garden & Housekeeping': '#10b981',
  'Repairs & Maintenance': '#f97316',
  'Plumbing & Drainage': '#0284c7',
  'Administrative': '#a855f7',
  'General': '#64748b',
};

export const FinancialInsightsPanel: React.FC<FinancialInsightsPanelProps> = ({
  expenses = [],
  invoices = [],
  isDark = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '6m' | '3m'>('6m');
  const [activeChartTab, setActiveChartTab] = useState<'monthlyBar' | 'categoryPie'>('monthlyBar');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e) => {
      if (e.Category) cats.add(e.Category);
    });
    return ['All', ...Array.from(cats)];
  }, [expenses]);

  // Aggregate monthly expenses by category
  const monthlyExpenseData = useMemo(() => {
    const monthsMap: Record<string, Record<string, number>> = {};

    expenses.forEach((exp) => {
      if (!exp.Date) return;
      if (selectedCategory !== 'All' && exp.Category !== selectedCategory) return;

      // Extract Month Year (YYYY-MM or Mon YYYY)
      const dateObj = new Date(exp.Date);
      const monthKey = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : exp.Date.substring(0, 7);

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {};
      }

      const cat = exp.Category || 'General';
      monthsMap[monthKey][cat] = (monthsMap[monthKey][cat] || 0) + (Number(exp.Amount) || 0);
    });

    const monthEntries = Object.entries(monthsMap).map(([month, catMap]) => {
      const total = Object.values(catMap).reduce((a, b) => a + b, 0);
      return {
        month,
        total,
        ...catMap,
      };
    });

    // Sort chronologically if possible
    monthEntries.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    if (selectedTimeframe === '3m') return monthEntries.slice(-3);
    if (selectedTimeframe === '6m') return monthEntries.slice(-6);
    return monthEntries;
  }, [expenses, selectedCategory, selectedTimeframe]);

  // Category breakdown for Pie/Donut Chart
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((exp) => {
      const cat = exp.Category || 'General';
      map[cat] = (map[cat] || 0) + (Number(exp.Amount) || 0);
    });

    const totalAll = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      percentage: totalAll > 0 ? Math.round((value / totalAll) * 100) : 0,
      color: CATEGORY_COLORS[name] || '#94a3b8',
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Key Financial Metrics
  const totalExpenseSum = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.Amount) || 0), 0);
  }, [expenses]);

  const topCategory = categoryBreakdown[0] || { name: 'None', value: 0, percentage: 0 };

  const avgMonthlyExpense = useMemo(() => {
    if (monthlyExpenseData.length === 0) return 0;
    return Math.round(totalExpenseSum / monthlyExpenseData.length);
  }, [totalExpenseSum, monthlyExpenseData]);

  return (
    <div className={`p-3 sm:p-4 rounded-2xl border transition-colors shadow-xs ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">
              Financial Insights & Expense Analytics
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Category-wise debit outflows, monthly variance, and operational expenditure breakdown.
          </p>
        </div>

        {/* View Toggle Buttons & Timeframe */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
            <button
              onClick={() => setActiveChartTab('monthlyBar')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                activeChartTab === 'monthlyBar'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Bar Chart</span>
            </button>
            <button
              onClick={() => setActiveChartTab('categoryPie')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                activeChartTab === 'categoryPie'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieIcon className="w-3 h-3" />
              <span>Share Breakdown</span>
            </button>
          </div>

          <select
            value={selectedTimeframe}
            onChange={(e: any) => setSelectedTimeframe(e.target.value)}
            className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className={`p-2.5 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Total Expenditures
          </span>
          <div className="text-sm font-black text-rose-600 dark:text-rose-400">
            ₹{totalExpenseSum.toLocaleString()}
          </div>
          <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
            {expenses.length} total logged bills
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Highest Category
          </span>
          <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 truncate">
            {topCategory.name}
          </div>
          <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
            ₹{topCategory.value.toLocaleString()} ({topCategory.percentage}%)
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Avg Monthly Outflow
          </span>
          <div className="text-sm font-black text-slate-800 dark:text-slate-100">
            ₹{avgMonthlyExpense.toLocaleString()}
          </div>
          <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
            across {monthlyExpenseData.length || 1} bill cycles
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Active Filter
          </span>
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-purple-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-[10px] font-bold bg-transparent text-purple-600 dark:text-purple-400 focus:outline-none w-full truncate"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[8px] text-slate-400 font-semibold block mt-0.5 truncate">
            {selectedCategory === 'All' ? 'Showing all expense categories' : `Filtered by ${selectedCategory}`}
          </span>
        </div>
      </div>

      {/* Main Visual Chart Area */}
      {activeChartTab === 'monthlyBar' ? (
        <div className="bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Category Comparison (₹ Outflow)
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Hover bars for exact category breakdowns
            </span>
          </div>

          <div className="w-full h-[200px] text-[9px] -ml-2">
            {monthlyExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#1e293b',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '10px',
                      padding: '6px 10px',
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                  />
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="a"
                      fill={CATEGORY_COLORS[cat] || '#818cf8'}
                      radius={[2, 2, 0, 0]}
                      name={cat}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-medium">
                No expense records available for this filter.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-700/50">
          {/* Pie Donut Chart */}
          <div className="w-full h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '10px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend List with Percentages */}
          <div className="space-y-1.5 overflow-y-auto max-h-[180px] pr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Category Distribution
            </span>
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-[10px] p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-slate-800 dark:text-slate-100">₹{item.value.toLocaleString()}</span>
                  <span className="text-[8px] font-bold text-slate-400 ml-1.5">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
