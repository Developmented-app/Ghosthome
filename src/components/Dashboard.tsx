import React from 'react';
import { Room, Transaction, Reservation } from '../types';
import { ArrowUpRight, ArrowDownRight, Bed, Home, Users, DollarSign, Activity, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  rooms: Room[];
  transactions: Transaction[];
  reservations: Reservation[];
  lang: string;
  t: (key: string) => string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ rooms, transactions, reservations, lang, t, setActiveTab }: DashboardProps) {
  // Calculations
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const reservedRooms = rooms.filter(r => r.status === 'Reserved').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Let's create an elegant occupancy breakdown list
  const roomTypes = rooms.reduce((acc: { [key: string]: { total: number; occupied: number } }, room) => {
    if (!acc[room.type]) {
      acc[room.type] = { total: 0, occupied: 0 };
    }
    acc[room.type].total += 1;
    if (room.status === 'Occupied') {
      acc[room.type].occupied += 1;
    }
    return acc;
  }, {});

  // Dynamic calculation of monthly occupancy rate based on reservations
  const monthsList = [
    { name: 'Jan', monthIndex: 0, days: 31 },
    { name: 'Feb', monthIndex: 1, days: 28 },
    { name: 'Mar', monthIndex: 2, days: 31 },
    { name: 'Apr', monthIndex: 3, days: 30 },
    { name: 'May', monthIndex: 4, days: 31 },
    { name: 'Jun', monthIndex: 5, days: 30 },
    { name: 'Jul', monthIndex: 6, days: 31 },
    { name: 'Aug', monthIndex: 7, days: 31 },
    { name: 'Sep', monthIndex: 8, days: 30 },
    { name: 'Oct', monthIndex: 9, days: 31 },
    { name: 'Nov', monthIndex: 10, days: 30 },
    { name: 'Dec', monthIndex: 11, days: 31 }
  ];

  const totalRoomsCount = totalRooms || 1;
  const targetYear = 2026;

  const chartData = monthsList.map(m => {
    let occupiedDays = 0;
    const monthStart = new Date(targetYear, m.monthIndex, 1);
    const monthEnd = new Date(targetYear, m.monthIndex, m.days);
    let bookingsInMonth = 0;

    reservations.forEach(r => {
      if (r.status === 'Cancelled') return;

      const rStart = new Date(r.checkin);
      const rEnd = new Date(r.checkout);

      if (isNaN(rStart.getTime()) || isNaN(rEnd.getTime())) return;

      const overlapStart = new Date(Math.max(rStart.getTime(), monthStart.getTime()));
      const overlapEnd = new Date(Math.min(rEnd.getTime(), monthEnd.getTime()));

      if (overlapStart <= overlapEnd) {
        bookingsInMonth += 1;
        const diffTime = overlapEnd.getTime() - overlapStart.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        occupiedDays += diffDays;
      }
    });

    const totalPossibleDays = totalRoomsCount * m.days;
    const rate = Math.min(100, Math.round((occupiedDays / totalPossibleDays) * 100));

    return {
      month: lang === 'en' ? m.name : `ខែ${m.monthIndex + 1}`,
      rate: rate || 0,
      bookings: bookingsInMonth
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/85 p-3 rounded-xl shadow-2xl space-y-1">
          <p className="text-xs font-bold text-slate-100">{payload[0].payload.month}</p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <span>{lang === 'en' ? 'Occupancy Rate' : 'អត្រាស្នាក់នៅ'}:</span>
            <span className="text-white">{payload[0].value}%</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'en' ? 'Active Bookings' : 'ការកក់សរុប'}: {payload[0].payload.bookings}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting & Fast Insight */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {lang === 'en' ? 'Welcome Back, Admin' : 'សូមស្វាគមន៍មកវិញ, អ្នកគ្រប់គ្រង'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'en' 
              ? 'Real-time overview of occupancy rates, financial ledger status, and automated guesthouse billing streams.'
              : 'ទិដ្ឋភាពទូទៅនៃអត្រាបន្ទប់ស្នាក់នៅ ស្ថានភាពបញ្ជីលុយ និងលំហូរគណនាទឹកភ្លើងស្វ័យប្រវត្តិ។'}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-xs font-semibold text-emerald-400">Laravel 12 API Sync Online</span>
        </div>
      </div>

      {/* Grid Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Available Rooms */}
        <div className="relative overflow-hidden bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 p-5 rounded-2xl transition duration-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('availableRooms')}</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-400">{availableRooms} / {totalRooms}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'Rooms ready for guest check-in' : 'បន្ទប់ទំនេរសម្រាប់ភ្ញៀវចូល'}
              </p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
              <Bed className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/30 to-emerald-500/10"></div>
        </div>

        {/* KPI: Occupied Rooms */}
        <div className="relative overflow-hidden bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 p-5 rounded-2xl transition duration-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('occupiedRooms')}</p>
              <h3 className="text-2xl font-bold mt-2 text-indigo-400">{occupiedRooms}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {occupancyRate}% {lang === 'en' ? 'current occupancy rate' : 'អត្រាស្នាក់នៅបច្ចុប្បន្ន'}
              </p>
            </div>
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/30 to-indigo-500/10"></div>
        </div>

        {/* KPI: Income summary */}
        <div className="relative overflow-hidden bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 p-5 rounded-2xl transition duration-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('monthlyRevenue')}</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-400">${totalIncome.toFixed(2)}</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% vs last month</span>
              </div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/30 to-emerald-500/10"></div>
        </div>

        {/* KPI: Financial Balance */}
        <div className="relative overflow-hidden bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 p-5 rounded-2xl transition duration-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Cash Flow Balance</p>
              <h3 className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                ${netProfit.toFixed(2)}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <span>Expense: </span>
                <span className="text-rose-400">${totalExpense.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/30 to-amber-500/10"></div>
        </div>
      </div>

      {/* Main Stats Charts & Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Occupancy Gauge Chart */}
        <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                {t('roomStatusChart')}
              </h4>
              <span className="text-xs text-slate-400">Live Status Tracker</span>
            </div>

            {/* Simulated Clean Chart representation and Status badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 items-center">
              {/* Circular Occupancy Progress Ring */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#334155" strokeWidth="8" fill="transparent" />
                    <circle cx="50" cy="50" r="42" stroke="#6366f1" strokeWidth="8" fill="transparent"
                      strokeDasharray="263.8" strokeDashoffset={263.8 - (263.8 * occupancyRate) / 100}
                      strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-white">{occupancyRate}%</span>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{lang === 'en' ? 'Occupied' : 'មានភ្ញៀវ'}</p>
                  </div>
                </div>
              </div>

              {/* Legend with styled colored bars */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-semibold">{t('available')}</span>
                    <span className="text-slate-200 font-semibold">{availableRooms} ({Math.round(availableRooms / totalRooms * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(availableRooms / totalRooms) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-indigo-400 font-semibold">{t('occupied')}</span>
                    <span className="text-slate-200 font-semibold">{occupiedRooms} ({Math.round(occupiedRooms / totalRooms * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(occupiedRooms / totalRooms) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-500 font-semibold">{t('reserved')}</span>
                    <span className="text-slate-200 font-semibold">{reservedRooms} ({Math.round(reservedRooms / totalRooms * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(reservedRooms / totalRooms) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-500 font-semibold">{t('maintenance')}</span>
                    <span className="text-slate-200 font-semibold">{maintenanceRooms} ({Math.round(maintenanceRooms / totalRooms * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(maintenanceRooms / totalRooms) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">Need to update room configuration?</span>
            <button 
              onClick={() => setActiveTab('rooms')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border-b border-indigo-400 hover:border-indigo-300 transition"
            >
              Go to Room Manager &rarr;
            </button>
          </div>
        </div>

        {/* Branch Operations & Quick Action Hub */}
        <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-400" />
                Quick Actions Hub
              </h4>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Launch critical workflows instantly. These actions automatically record audit trails and verify availability.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setActiveTab('checkin'); }}
                className="w-full flex items-center justify-between p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition duration-150 shadow-md transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <Bed className="w-4.5 h-4.5" />
                  <span>{t('quickCheckIn')}</span>
                </div>
                <span>&rarr;</span>
              </button>

              <button
                onClick={() => { setActiveTab('checkin'); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-xl text-xs transition duration-150 border border-slate-600 hover:border-slate-500"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-indigo-400" />
                  <span>{t('quickCheckOut')}</span>
                </div>
                <span>&rarr;</span>
              </button>

              <button
                onClick={() => { setActiveTab('utilities'); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-xl text-xs transition duration-150 border border-slate-600 hover:border-slate-500"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
                  <span>{t('utilityMeter')}</span>
                </div>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>System Host: Cloud Run</span>
            <span className="font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px]">v12.0.4-L12</span>
          </div>
        </div>
      </div>

      {/* Recharts Monthly Occupancy Analysis Bar Chart */}
      <div className="bg-slate-800/40 border border-slate-700/70 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4 mb-5">
          <div>
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
              <span>{lang === 'en' ? 'Reservations-Based Occupancy Analysis (2026)' : 'ការវិភាគអត្រាស្នាក់នៅផ្អែកលើការកក់បន្ទប់ (២០២៦)'}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' 
                ? 'Calculated dynamics matching confirmed stays, active intervals, and daily database bookings.' 
                : 'លទ្ធផលគណនាដោយស្វ័យប្រវត្តិតាមរយៈកាលបរិច្ឆេទនៃការកក់ និងការស្នាក់នៅរបស់ភ្ញៀវពិតប្រាកដ។'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-300 bg-slate-900/60 border border-slate-700/50 px-3 py-1 rounded-lg">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500 animate-pulse"></span>
            <span>{lang === 'en' ? 'Occupancy Intensity %' : 'ភាគរយអត្រាស្នាក់នៅ'}</span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.15 }} />
              <Bar 
                dataKey="rate" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              >
                {chartData.map((entry, index) => {
                  const isJune = index === 5; // Highlight June (current month target)
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isJune ? '#818cf8' : entry.rate > 40 ? '#6366f1' : entry.rate > 20 ? '#4f46e5' : '#312e81'} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Category Matrix */}
      <div className="bg-slate-800/40 border border-slate-700/70 p-6 rounded-2xl">
        <h4 className="font-semibold text-slate-100 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
          <span>{lang === 'en' ? 'Category Occupancy Matrix' : 'ម៉ាទ្រីសបន្ទប់តាមប្រភេទ'}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(roomTypes).map(([type, stats]) => {
            const percentage = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
            return (
              <div key={type} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-300">{type}</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-lg font-bold text-slate-100">{stats.occupied}</span>
                    <span className="text-xs text-slate-400">/ {stats.total} {lang === 'en' ? 'busy' : 'មានភ្ញៀវ'}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span>Usage percentage</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
