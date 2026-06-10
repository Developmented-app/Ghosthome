import React, { useState } from 'react';
import { Transaction } from '../types';
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Layers, Coins } from 'lucide-react';

interface IncomeExpenseProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
  exchangeRate: number;
  setExchangeRate: React.Dispatch<React.SetStateAction<number>>;
}

export default function IncomeExpense({ transactions, setTransactions, lang, t, triggerToast, exchangeRate, setExchangeRate }: IncomeExpenseProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Converter tool states
  const [calcUsd, setCalcUsd] = useState<string>('1');
  const [calcKhr, setCalcKhr] = useState<string>(String(exchangeRate));

  // New Transaction Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number>(100);
  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !amount || amount <= 0) {
      triggerToast(t('validationError'));
      return;
    }

    const created: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      category: category.trim(),
      amount,
      type,
      date
    };

    setTransactions([created, ...transactions]);
    triggerToast(lang === 'en' ? `Transaction "${created.category}" logged successfully.` : `ប្រតិបត្តិការ "${created.category}" ត្រូវបានកត់ត្រា`);

    // resets
    setCategory('');
    setAmount(100);
    setType('Income');
  };

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, item) => sum + item.amount, 0);
  const ledgerBalance = totalIncome - totalExpense;

  const filtered = transactions.filter(tr => {
    const matchesSearch = tr.category.toLowerCase().includes(search.toLowerCase()) || tr.date.includes(search);
    const matchesType = typeFilter === 'All' ? true : tr.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Exchange Rate Banner */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl animate-in fade-in duration-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('incomeExpense')}</h2>
          <p className="text-xs text-slate-400">Track incoming rentals, operating expenditures, maintenance receipts, and salaries.</p>
        </div>
        
        {/* Dynamic Currency Settings & Converter Widget */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto bg-slate-900/60 border border-slate-700/55 rounded-xl p-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Rate (USD/KHR):</span>
          </div>

          {/* Rate Editor */}
          <div className="bg-slate-950 border border-slate-700/85 rounded-lg px-2 py-1 flex items-center gap-1.5">
            <span className="text-slate-450 text-[11px] font-bold">1 USD =</span>
            <input 
              type="number"
              value={exchangeRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) {
                  setExchangeRate(val);
                  if (calcUsd !== '') {
                    setCalcKhr(String(Math.round(Number(calcUsd) * val)));
                  }
                }
              }}
              className="bg-transparent text-emerald-400 font-mono font-bold text-xs outline-none w-14 text-center"
              title="Edit daily exchange rate"
            />
            <span className="text-slate-450 text-[11px] font-mono font-bold">KHR</span>
          </div>

          <div className="hidden sm:block border-l border-slate-700/60 h-5" />

          {/* Conversion Tool on the fly */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-700/85 rounded-lg px-2 py-1">
            <input 
              type="number"
              placeholder="USD"
              value={calcUsd}
              onChange={(e) => {
                const v = e.target.value;
                setCalcUsd(v);
                if (v === '') {
                  setCalcKhr('');
                } else {
                  setCalcKhr(String(Math.round(Number(v) * exchangeRate)));
                }
              }}
              className="bg-transparent text-white font-mono text-xs w-12 outline-none text-center"
            />
            <span className="text-slate-500 text-[10px] font-bold">USD</span>
            <span className="text-slate-400 text-[10px]">&harr;</span>
            <input 
              type="number"
              placeholder="KHR"
              value={calcKhr}
              onChange={(e) => {
                const v = e.target.value;
                setCalcKhr(v);
                if (v === '') {
                  setCalcUsd('');
                } else {
                  setCalcUsd(String(Number((Number(v) / exchangeRate).toFixed(2))));
                }
              }}
              className="bg-transparent text-white font-mono text-xs w-20 outline-none text-center"
            />
            <span className="text-slate-500 text-[10px] font-bold">KHR</span>
          </div>
        </div>
      </div>

      {/* Mini Profit & Loss Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('income')}</span>
            <h4 className="text-xl font-bold text-emerald-400 mt-1">${totalIncome.toFixed(2)}</h4>
            <span className="text-[10px] font-mono font-bold text-emerald-500/95 block mt-0.5">≒ {Math.round(totalIncome * exchangeRate).toLocaleString()} KHR</span>
          </div>
          <ArrowUpRight className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('expense')}</span>
            <h4 className="text-xl font-bold text-rose-400 mt-1">${totalExpense.toFixed(2)}</h4>
            <span className="text-[10px] font-mono font-bold text-rose-550 block mt-0.5">≒ {Math.round(totalExpense * exchangeRate).toLocaleString()} KHR</span>
          </div>
          <ArrowDownRight className="w-8 h-8 text-rose-500/30" />
        </div>

        <div className={`border p-4 rounded-xl flex items-center justify-between transition duration-200 ${
          ledgerBalance >= 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Run Profit Margin</span>
            <h4 className={`text-xl font-bold mt-1 ${ledgerBalance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              ${ledgerBalance.toFixed(2)}
            </h4>
            <span className={`text-[10px] font-mono font-bold block mt-0.5 ${ledgerBalance >= 0 ? 'text-amber-500/95' : 'text-rose-500/95'}`}>
              ≒ {Math.round(ledgerBalance * exchangeRate).toLocaleString()} KHR
            </span>
          </div>
          <DollarSign className="w-8 h-8 text-slate-500/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Insert manual item */}
        <div className="lg:col-span-4 bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-4">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">{t('addTransaction')}</h3>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">{t('category')} *</label>
              <input 
                type="text" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Toilet Plumbing Repair"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">{t('amount')} ($) *</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                required
              />
              {amount > 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-500/90 mt-1 block">
                  ≒ {Math.round(amount * exchangeRate).toLocaleString()} KHR
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('type')}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="Income">Income (+)</option>
                  <option value="Expense">Expense (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('date')}</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition duration-150"
            >
              Commit Ledger Entry
            </button>
          </form>
        </div>

        {/* ledger history log lists */}
        <div className="lg:col-span-8 bg-slate-800/20 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-700/60 bg-slate-900/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Transaction Audit Ledger</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Find record..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-755 rounded-lg pl-8 p-1.5 text-xs outline-none focus:border-indigo-500 transition text-white w-28 sm:w-44"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="All">{t('all')}</option>
                <option value="Income">Incomes</option>
                <option value="Expense">Expenses</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  <th className="py-3.5 px-4">{t('category')}</th>
                  <th className="py-3.5 px-4">{t('date')}</th>
                  <th className="py-3.5 px-4">{t('type')}</th>
                  <th className="py-3.5 px-4 text-right">Amount (USD / KHR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 font-mono">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">{item.category}</td>
                    <td className="py-3.5 px-4 text-slate-400">{item.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'Income' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                      item.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      <span className="block">{item.type === 'Income' ? '+' : '-'}${item.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold block">≒ {item.type === 'Income' ? '+' : '-'}{Math.round(item.amount * exchangeRate).toLocaleString()} KHR</span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      {t('noRecords')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
