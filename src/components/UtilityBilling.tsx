import React, { useState } from 'react';
import { UtilityBill, Room } from '../types';
import { Lightbulb, Droplets, Wifi, ShieldAlert, Plus, Search, Calendar, Landmark, Coins, Edit2 } from 'lucide-react';

interface UtilityBillingProps {
  utilities: UtilityBill[];
  setUtilities: React.Dispatch<React.SetStateAction<UtilityBill[]>>;
  rooms: Room[];
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
  exchangeRate: number;
  setExchangeRate: React.Dispatch<React.SetStateAction<number>>;
}

export default function UtilityBilling({ utilities, setUtilities, rooms, lang, t, triggerToast, exchangeRate, setExchangeRate }: UtilityBillingProps) {
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Converter tool states
  const [calcUsd, setCalcUsd] = useState<string>('1');
  const [calcKhr, setCalcKhr] = useState<string>(String(exchangeRate));

  // Form states
  const [elecPrev, setElecPrev] = useState(1250);
  const [elecCurr, setElecCurr] = useState(1390);
  const [waterPrev, setWaterPrev] = useState(450);
  const [waterCurr, setWaterCurr] = useState(472);
  const [internet, setInternet] = useState(10);
  const [parking, setParking] = useState(5);
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);

  // Local Cambodia average utility rates:
  // Electricity: $0.20 (approx 800 KHR) per kWh
  // Water: $0.45 (approx 1800 KHR) per m³
  const ELEC_RATE = 0.20; 
  const WATER_RATE = 0.45;

  const runAutoCalculate = () => {
    if (elecCurr < elecPrev || waterCurr < waterPrev) {
      triggerToast(lang === 'en' ? "Current meter readings cannot be lower than previous readings!" : "លេខកុងទ័រថ្មីមិនអាចទាបជាងលេខចាស់ទេ!");
      return;
    }
    const elecUsage = elecCurr - elecPrev;
    const waterUsage = waterCurr - waterPrev;

    const elecCost = elecUsage * ELEC_RATE;
    const waterCost = waterUsage * WATER_RATE;

    const grandTotal = elecCost + waterCost + internet + parking;
    setCalculatedTotal(parseFloat(grandTotal.toFixed(2)));
    triggerToast(lang === 'en' ? `Auto-calculated total bill: $${grandTotal.toFixed(2)}` : `តម្លៃសរុបគណនាស្វ័យប្រវត្ត៖ $${grandTotal.toFixed(2)}`);
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      triggerToast(t('validationError'));
      return;
    }

    if (elecCurr < elecPrev || waterCurr < waterPrev) {
      triggerToast(lang === 'en' ? "Verify readings." : "សូមពិនិត្យអំណានកុងទ័រឡើងវិញ");
      return;
    }

    const elecUsage = elecCurr - elecPrev;
    const waterUsage = waterCurr - waterPrev;
    const finalTotal = parseFloat(((elecUsage * ELEC_RATE) + (waterUsage * WATER_RATE) + internet + parking).toFixed(2));

    const added: UtilityBill = {
      id: utilities.length > 0 ? Math.max(...utilities.map(u => u.id)) + 1 : 1,
      room_no: selectedRoom,
      elec_prev: elecPrev,
      elec_curr: elecCurr,
      water_prev: waterPrev,
      water_curr: waterCurr,
      internet,
      parking,
      total: finalTotal
    };

    setUtilities([added, ...utilities]);
    triggerToast(`Utility Bill logged for Room ${selectedRoom}`);

    // resets
    setSelectedRoom('');
    setElecPrev(1250);
    setElecCurr(1250);
    setWaterPrev(450);
    setWaterCurr(450);
    setCalculatedTotal(null);
  };

  const filtered = utilities.filter(u => u.room_no.includes(search));

  return (
    <div className="space-y-6">
      
      {/* Title & Exchange Rate Banner */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('utilityBilling')}</h2>
          <p className="text-xs text-slate-400">Calculate utility meter readings, apply dynamic Cambodia consumption rates, and emit invoices.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Computing Form Panel */}
        <div className="lg:col-span-4 bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-4">
            <Landmark className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Meter Entry & Rates Engine</h3>
          </div>

          <form onSubmit={handleSaveBill} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">{t('roomNo')} *</label>
              <select
                value={selectedRoom}
                onChange={(e) => {
                  setSelectedRoom(e.target.value);
                  const randomBaseElec = Math.floor(Math.random() * 2000 + 1000);
                  const randomBaseWater = Math.floor(Math.random() * 500 + 100);
                  setElecPrev(randomBaseElec);
                  setElecCurr(randomBaseElec + Math.floor(Math.random() * 150 + 20));
                  setWaterPrev(randomBaseWater);
                  setWaterCurr(randomBaseWater + Math.floor(Math.random() * 30 + 5));
                  setCalculatedTotal(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-indigo-500 transition"
                required
              >
                <option value="">-- Select Room --</option>
                {rooms.map(rm => (
                  <option key={rm.id} value={rm.room_no} className="text-slate-850">
                    Room {rm.room_no} ({rm.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Electricity */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Electricity Reading (kWh)</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-450 mb-0.5">Prev</label>
                  <input
                    type="number"
                    value={elecPrev}
                    onChange={(e) => { setElecPrev(Number(e.target.value)); setCalculatedTotal(null); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 mb-0.5">Curr</label>
                  <input
                    type="number"
                    value={elecCurr}
                    onChange={(e) => { setElecCurr(Number(e.target.value)); setCalculatedTotal(null); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Water */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-indigo-400" />
                <span>Water Reading (m³)</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-450 mb-0.5">Prev</label>
                  <input
                    type="number"
                    value={waterPrev}
                    onChange={(e) => { setWaterPrev(Number(e.target.value)); setCalculatedTotal(null); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 mb-0.5">Curr</label>
                  <input
                    type="number"
                    value={waterCurr}
                    onChange={(e) => { setWaterCurr(Number(e.target.value)); setCalculatedTotal(null); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Other fixed items */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-0.5">{t('internet')}</label>
                <input
                  type="number"
                  value={internet}
                  onChange={(e) => { setInternet(Number(e.target.value)); setCalculatedTotal(null); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-0.5">{t('parking')}</label>
                <input
                  type="number"
                  value={parking}
                  onChange={(e) => { setParking(Number(e.target.value)); setCalculatedTotal(null); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Formula output indicators */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-[10px] text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-300 block uppercase tracking-wider mb-1">Cambodian Standard Coefficients:</span>
              <div className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded border border-slate-800">
                <span>· Electricity Usage:</span>
                <span className="font-bold text-white">${ELEC_RATE} / {Math.round(ELEC_RATE * exchangeRate)} KHR per kWh</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded border border-slate-800 border-t-0">
                <span>· Water Usage:</span>
                <span className="font-bold text-white">${WATER_RATE} / {Math.round(WATER_RATE * exchangeRate)} KHR per m³</span>
              </div>
            </div>

            {calculatedTotal !== null && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Calculated Invoice sum</span>
                <span className="text-xl font-extrabold text-emerald-400 tracking-tight block">${calculatedTotal.toFixed(2)}</span>
                <span className="text-[11px] font-mono font-bold text-emerald-500 mt-0.5 block">≒ {Math.round(calculatedTotal * exchangeRate).toLocaleString()} KHR</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={runAutoCalculate}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition"
              >
                {t('autoCalc')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md"
              >
                Log billing
              </button>
            </div>
          </form>
        </div>

        {/* Historic Ledger Tables */}
        <div className="lg:col-span-8 bg-slate-800/20 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-700/60 bg-slate-900/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Meter Reading Archives</span>
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Find room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-755 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  <th className="py-3 px-4">{t('roomNo')}</th>
                  <th className="py-3 px-4">Elec Consumption</th>
                  <th className="py-3 px-4">Water Consumption</th>
                  <th className="py-3 px-4">Fixed Net/Pkg</th>
                  <th className="py-3 px-4 text-right">Invoice Sum (USD / KHR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-3.5 px-4 font-bold text-indigo-300">Room {rec.room_no}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 block">{rec.elec_curr - rec.elec_prev} kWh</span>
                      <span className="text-[10px] text-slate-500 font-mono">({rec.elec_prev} &rarr; {rec.elec_curr})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 block">{rec.water_curr - rec.water_prev} m³</span>
                      <span className="text-[10px] text-slate-500 font-mono">({rec.water_prev} &rarr; {rec.water_curr})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-350">
                      Internet: ${rec.internet} | Pkg: ${rec.parking}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-emerald-400 font-bold text-sm block">${rec.total.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">≒ {Math.round(rec.total * exchangeRate).toLocaleString()} KHR</span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
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
