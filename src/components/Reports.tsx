import React from 'react';
import { Room, Transaction, Staff } from '../types';
import { Download, FileText, BarChart, Printer, PieChart, Activity, DollarSign, FileSpreadsheet } from 'lucide-react';

interface ReportsProps {
  rooms: Room[];
  transactions: Transaction[];
  staff: Staff[];
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function Reports({ rooms, transactions, staff, lang, t, triggerToast }: ReportsProps) {
  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleExport = (format: 'PDF' | 'Excel') => {
    triggerToast(`Exporting operational audit files as guesthouse_report_2026.${format === 'PDF' ? 'pdf' : 'xlsx'} ...`);
  };

  const downloadCSV = () => {
    try {
      if (!transactions || transactions.length === 0) {
        triggerToast(lang === 'en' ? 'No transactions available to download.' : 'គ្មានទិន្នន័យប្រតិបត្តិការដើម្បីទាញយកឡើយ។');
        return;
      }

      // CSV Header
      const headers = ['Transaction ID', 'Category', 'Amount (USD)', 'Type', 'Date'];
      
      // CSV Rows - secure string sanitization and formatting
      const rows = transactions.map(t => [
        t.id,
        `"${t.category.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.date
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');
      
      // UTF-8 BOM to guarantee integrity in different local Excel readers
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `guesthouse_transaction_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      triggerToast(lang === 'en' 
        ? `Successfully exported ${transactions.length} ledger logs to CSV!` 
        : `ទាញយកឯកសារប្រតិបត្តិការ ${transactions.length} ជោគជ័យជាប្រភេទ CSV!`);
    } catch (error) {
      console.error('CSV export failure', error);
      triggerToast(lang === 'en' ? 'Failed to process CSV file generation.' : 'ការបង្កើតទិន្នន័យ CSV ជួបបញ្ហា។');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('reports')}</h2>
          <p className="text-xs text-slate-400">Compile financial balance metrics, summary inventory catalogs, and export files.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-350 border border-emerald-500/25 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
            title="Download full database transaction ledger as a .csv file"
            id="download-ledger-csv-top"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-150 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-150 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Excel Sheet</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Ratios grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inventory balance card */}
        <div className="bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-700 pb-3 mb-4 flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-indigo-450" />
            <span>Lodgment Income Breakdown</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total rooms catalog value (monthly max):</span>
              <span className="font-bold text-slate-100">${rooms.reduce((sum, r) => sum + r.monthly_price, 0)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Average Room Price:</span>
              <span className="font-bold text-slate-100">${Math.round(rooms.reduce((sum, r) => sum + r.daily_price, 0) / rooms.length)}/day</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-750">
              <span className="text-slate-400">Number of employees supported:</span>
              <span className="font-bold text-slate-100">{staff.length} staffs</span>
            </div>
          </div>
        </div>

        {/* Operating cash ratios */}
        <div className="bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-700 pb-3 mb-4 flex items-center gap-2">
              <BarChart className="w-4.5 h-4.5 text-indigo-455" />
              <span>Operating Efficiency Metrics</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Total profit conversion ratio</span>
                  <span className="font-bold text-slate-100">{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Salary overhead allocation ratio</span>
                  <span className="font-bold text-slate-100">{totalIncome > 0 ? Math.round((staff.reduce((sum, s) => sum + s.salary, 0) / totalIncome) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round((staff.reduce((sum, s) => sum + s.salary, 0) / totalIncome) * 100)) : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-750 text-[10px] text-slate-450 leading-relaxed">
            Report Compiled: {new Date().toLocaleDateString()} Phnom Penh UTC · System Sandbox Node Active
          </div>
        </div>
      </div>

      {/* Table grid of recent consolidated transactions */}
      <div className="bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl">
        <h3 className="font-bold text-slate-100 text-sm mb-4">Consolidated Room Stay Inventory</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                <th className="py-3 px-4">Room No</th>
                <th className="py-3 px-4">Tier Category Type</th>
                <th className="py-3 px-4">Daily / Monthly Rate</th>
                <th className="py-3 px-4 text-right">Current occupancy state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-705">
              {rooms.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/10 transition">
                  <td className="py-3 px-4 font-bold text-white">Room {r.room_no}</td>
                  <td className="py-3 px-4 text-indigo-350 font-medium">{r.type}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">${r.daily_price}/day · ${r.monthly_price}/month</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      r.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                      r.status === 'Occupied' ? 'bg-indigo-500/10 text-indigo-400' :
                      r.status === 'Reserved' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-450'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Transactions Ledger Preview card */}
      <div className="bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Financial Transactions Ledger</h3>
            <p className="text-[10px] text-slate-400 mt-1">Audit log of payments received and operational expenses logged.</p>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-350 border border-emerald-500/25 font-bold text-[10px] px-3 py-1.5 rounded-xl transition no-print cursor-pointer"
            title="Export transaction historical data to spreadsheet CSV format"
            id="download-ledger-csv-table"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Full CSV</span>
          </button>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                <th className="py-3 px-4 font-sans">Date</th>
                <th className="py-3 px-4 font-sans">Category</th>
                <th className="py-3 px-4 font-sans">Type</th>
                <th className="py-3 px-4 font-sans text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-705">
              {transactions.slice(0, 6).map(t => (
                <tr key={t.id} className="hover:bg-slate-800/10 transition">
                  <td className="py-3 px-4 text-slate-300">{t.date}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white">{t.category}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right font-bold font-sans ${
                    t.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                    No transactions entered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
