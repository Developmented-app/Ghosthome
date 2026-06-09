import React, { useState } from 'react';
import { Room, Transaction, Guest } from '../types';
import { KeyRound, ArrowLeftRight, CreditCard, Receipt, Milestone, Plus, RefreshCw, FileText, CheckCircle, QrCode, ScanLine } from 'lucide-react';

interface CheckInOutProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  guests: Guest[];
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function CheckInOut({ rooms, setRooms, transactions, setTransactions, guests, lang, t, triggerToast }: CheckInOutProps) {
  const [activeSubTab, setActiveSubTab] = useState<'checkin' | 'checkout'>('checkin');

  // QR Code fast-scan console simulation states
  const [selectedScanGuestId, setSelectedScanGuestId] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedGuestInfo, setScannedGuestInfo] = useState<Guest | null>(null);

  // CheckIn Form States
  const [guestName, setGuestName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [days, setDays] = useState(2);
  const [deposit, setDeposit] = useState(20);
  const [dailyRate, setDailyRate] = useState(25);

  // CheckOut Form States
  const [checkoutRoomNo, setCheckoutRoomNo] = useState('');
  const [damageCharge, setDamageCharge] = useState(0);
  const [utilityCharge, setUtilityCharge] = useState(15);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);

  // Invoice Display State
  const [invoice, setInvoice] = useState<any | null>(null);

  // Filter occupied/available rooms respectively
  const availableRooms = rooms.filter(r => r.status === 'Available');
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied');

  const playScanSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1400, audioCtx.currentTime); // high, short beep 
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.log("Audio contexts blocked or not supported on client run");
    }
  };

  const handleSimulateScan = (guestIdStr: string) => {
    if (!guestIdStr) {
      setScanStatus('idle');
      setScannedGuestInfo(null);
      return;
    }
    const targetGuest = guests.find(g => g.id === Number(guestIdStr));
    if (!targetGuest) return;

    setScanStatus('scanning');
    triggerToast(lang === 'en' ? `Initializing QR Scanner Cam...` : `កំពុងដំណើរការម៉ាស៊ីនស្កេន QR...`);

    setTimeout(() => {
      setScanStatus('success');
      setScannedGuestInfo(targetGuest);
      setGuestName(targetGuest.name); // populate guestName state to auto-fill form
      playScanSound();
      triggerToast(lang === 'en' ? `✓ QR Verified: ${targetGuest.name} auto-filled!` : `✓ បានផ្ទៀងផ្ទាត់ QR៖ បំពេញដោយស្វ័យប្រវត្តិសម្រាប់ ${targetGuest.name}!`);
    }, 1100);
  };

  const handleRoomSelect = (no: string) => {
    setRoomNo(no);
    const selected = rooms.find(r => r.room_no === no);
    if (selected) {
      setDailyRate(selected.daily_price);
    }
  };

  const executeCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !roomNo) {
      triggerToast(t('validationError'));
      return;
    }

    const totalCalculated = days * dailyRate;

    // Transition room to Occupied
    setRooms(prev => prev.map(r => r.room_no === roomNo ? { ...r, status: 'Occupied' } : r));

    // Register check-in transactional payment ledger
    const addedTransaction: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(tr => tr.id)) + 1 : 1,
      category: `Guest Stay Check-in: ${guestName.trim()} (Room ${roomNo})`,
      amount: totalCalculated,
      type: 'Income',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([addedTransaction, ...transactions]);

    // Create the invoice
    const createdInvoice = {
      invoice_no: 'INV-IN-' + Math.floor(Math.random() * 90000 + 10000),
      type: 'Check-In Receipt',
      guest: guestName.trim(),
      room: roomNo,
      days,
      rate: dailyRate,
      deposit,
      subtotal: totalCalculated,
      total: totalCalculated + deposit, // billing captures stay prepayment + security deposit
      date: new Date().toISOString().split('T')[0]
    };

    setInvoice(createdInvoice);
    triggerToast(lang === 'en' ? `Guest ${guestName.trim()} checked into Room ${roomNo}.` : `ភ្ញៀវ ${guestName.trim()} ចូលបន្ទប់លេខ ${roomNo} រួចរាល់។`);

    // reset
    setGuestName('');
    setRoomNo('');
    setDays(2);
    setDeposit(20);
  };

  const executeCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutRoomNo) {
      triggerToast(t('validationError'));
      return;
    }

    const matchedRoom = rooms.find(r => r.room_no === checkoutRoomNo);
    if (!matchedRoom) return;

    const rentalTotal = matchedRoom.daily_price * 2; // Simulated stay of 2 days
    const totalDue = rentalTotal + utilityCharge + damageCharge - checkoutDiscount;

    // Transition room status to Available
    setRooms(prev => prev.map(r => r.room_no === checkoutRoomNo ? { ...r, status: 'Available' } : r));

    // Log checkout transaction ledger
    const addedTransaction: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(tr => tr.id)) + 1 : 1,
      category: `Guest Stay Check-out & Settlement (Room ${checkoutRoomNo})`,
      amount: totalDue,
      type: 'Income',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([addedTransaction, ...transactions]);

    // Create final checkout settlement bill
    const createdInvoice = {
      invoice_no: 'INV-OUT-' + Math.floor(Math.random() * 90000 + 10000),
      type: 'Check-Out Settlement Receipt',
      guest: `Resident of Room ${checkoutRoomNo}`,
      room: checkoutRoomNo,
      days: 2,
      rate: matchedRoom.daily_price,
      deposit: 20, // refund credit
      subtotal: rentalTotal,
      utilities: utilityCharge,
      damages: damageCharge,
      discount: checkoutDiscount,
      total: totalDue,
      date: new Date().toISOString().split('T')[0]
    };

    setInvoice(createdInvoice);
    triggerToast(`Check-out settled for Room ${checkoutRoomNo}. Invoice created.`);

    // Reset checkout states
    setCheckoutRoomNo('');
    setDamageCharge(0);
    setUtilityCharge(15);
    setCheckoutDiscount(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('checkInOut')}</h2>
          <p className="text-xs text-slate-400">Instantly execute check-in bookings, complete stays, and emit settled balance receipts.</p>
        </div>

        {/* Toggle Nav */}
        <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 inline-flex">
          <button
            onClick={() => { setActiveSubTab('checkin'); setInvoice(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'checkin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('quickCheckIn')}
          </button>
          <button
            onClick={() => { setActiveSubTab('checkout'); setInvoice(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'checkout' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('quickCheckOut')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active execution forms */}
        <div className="lg:col-span-5 bg-slate-800/20 border border-slate-700/60 p-6 rounded-2xl shadow-sm no-print">
          {activeSubTab === 'checkin' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-base">Check-In Registration Panel</h3>
              </div>

              {/* QR FAST CHECK-IN SCANNER SIMULATOR */}
              <div className="bg-slate-900/60 border border-indigo-500/15 rounded-xl p-4 space-y-3.5 relative overflow-hidden my-3">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600"></div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                    <span>QR Code Scanner Console</span>
                  </span>
                  <span className="text-[9px] bg-slate-800 border border-slate-750 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded leading-none">
                    Hardware Emulated
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'en' 
                    ? 'Scan arrivals instantly. Select any registered profile to display their unique code. Clicking simulate automatically decodes the ticket values and populates the check-in forms.' 
                    : 'ស្កេនការមកដល់ភ្លាមៗ។ ជ្រើសរើសព័ត៌មានភ្ញៀវ ដើម្បីបង្ហាញកូដ QR រួចស្កេនដើម្បីបំពេញព័ត៌មានដោយស្វ័យប្រវត្តិ។'}
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {lang === 'en' ? 'Select Registered Guest QR Pass' : 'ជ្រើសរើសកូដ QR ភ្ញៀវ'}
                  </label>
                  <select
                    value={selectedScanGuestId}
                    onChange={(e) => {
                      setSelectedScanGuestId(e.target.value);
                      setScanStatus('idle');
                      setScannedGuestInfo(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 outline-none cursor-pointer focus:border-indigo-500 transition font-semibold"
                  >
                    <option value="">-- {lang === 'en' ? 'Choose Guest to Simulate Scan...' : 'ជ្រើសរើសព័ត៌មានភ្ញៀវ...'} --</option>
                    {guests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} (Passport ID: {g.id_passport})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedScanGuestId && (() => {
                  const activeGuest = guests.find(g => g.id === Number(selectedScanGuestId));
                  if (!activeGuest) return null;

                  return (
                    <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mt-1 transition animate-in fade-in duration-200">
                      {/* Interactive Visual Scan view Finder */}
                      <div className="relative w-20 h-20 bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent('GUEST:' + activeGuest.id + '::' + activeGuest.name)}`} 
                          alt="QR Code" 
                          className="w-16 h-16 rounded"
                          referrerPolicy="no-referrer"
                        />
                        {/* Flashing scanner laser line beam overlay */}
                        {scanStatus === 'scanning' && (
                          <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-rose-500 absolute top-1/2 left-0 animate-bounce shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                          </div>
                        )}
                        {scanStatus === 'success' && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold text-lg">✓</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        <div className="space-y-0.5 text-[10px]">
                          <span className="block text-slate-500 font-mono uppercase tracking-wider text-[8px]">QR Ticket Payload:</span>
                          <span className="block font-mono text-indigo-300 break-all font-semibold leading-tight">
                            GUEST_{activeGuest.id}_{activeGuest.id_passport.substring(0, 5)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSimulateScan(selectedScanGuestId)}
                          disabled={scanStatus === 'scanning'}
                          className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${
                            scanStatus === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          }`}
                        >
                          <ScanLine className="w-3.5 h-3.5" />
                          <span>
                            {scanStatus === 'scanning' ? 'Processing...' : 
                             scanStatus === 'success' ? 'Verification OK ✓' : 'Simulate Scanner Cam'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {scanStatus === 'success' && scannedGuestInfo && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-emerald-400 animate-in fade-in duration-300">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Credential decoded:</span> {scannedGuestInfo.name} has been pre-selected. Ready for checkout rate calculations.
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={executeCheckIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('guestName')} *</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Sok Mean"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Available Room *</label>
                  <select
                    value={roomNo}
                    onChange={(e) => handleRoomSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-indigo-500 transition"
                    required
                  >
                    <option value="">-- Choose Available Room --</option>
                    {availableRooms.map(rm => (
                      <option key={rm.id} value={rm.room_no} className="text-slate-850">
                        Room {rm.room_no} / {rm.type} (${rm.daily_price}/day)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Days of Stay *</label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      min="1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Key Deposit ($)</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {roomNo && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Room Stay cost ({days} days x ${dailyRate}/day):</span>
                      <span className="font-semibold text-white">${days * dailyRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Deposit Amount (Refundable):</span>
                      <span className="font-semibold text-white">${deposit}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-bold text-indigo-300">
                      <span>Grand Total:</span>
                      <span>${(days * dailyRate) + deposit}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs text-white transition duration-150 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Execute Check-In & emit Receipt</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-base">Check-Out Settlement Panel</h3>
              </div>

              <form onSubmit={executeCheckOut} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Occupied Room *</label>
                  <select
                    value={checkoutRoomNo}
                    onChange={(e) => setCheckoutRoomNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-indigo-500 transition"
                    required
                  >
                    <option value="">-- Select Occupied Room --</option>
                    {occupiedRooms.map(rm => (
                      <option key={rm.id} value={rm.room_no} className="text-slate-850">
                        Room {rm.room_no} (Daily Rate: ${rm.daily_price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Damages Fee ($)</label>
                    <input
                      type="number"
                      value={damageCharge}
                      onChange={(e) => setDamageCharge(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Additional Utilities Fee ($)</label>
                    <input
                      type="number"
                      value={utilityCharge}
                      onChange={(e) => setUtilityCharge(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign Discount ($)</label>
                  <input
                    type="number"
                    value={checkoutDiscount}
                    onChange={(e) => setCheckoutDiscount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {checkoutRoomNo && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>Simulated Room Stay Cost (2 days):</span>
                      <span className="text-white">${(rooms.find(r => r.room_no === checkoutRoomNo)?.daily_price || 0) * 2}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Excess Utilities Fee:</span>
                      <span className="text-rose-400">+${utilityCharge}</span>
                    </div>
                    {damageCharge > 0 && (
                      <div className="flex justify-between font-medium text-rose-400">
                        <span>Physical damages reported:</span>
                        <span>+${damageCharge}</span>
                      </div>
                    )}
                    {checkoutDiscount > 0 && (
                      <div className="flex justify-between font-medium text-emerald-400">
                        <span>Applied discount/credits:</span>
                        <span>-${checkoutDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-bold text-indigo-300">
                      <span>Settle Total Balance:</span>
                      <span>
                        ${((rooms.find(r => r.room_no === checkoutRoomNo)?.daily_price || 0) * 2) + utilityCharge + damageCharge - checkoutDiscount}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 font-bold rounded-xl text-xs text-white transition duration-150 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Execute Settlement & Settle Room</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Live thermal paper invoice output */}
        <div className="lg:col-span-7 bg-slate-800/20 border border-slate-700/60 p-6 rounded-2xl min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-base">Receipt & Settlement Invoice Emitted</h3>
            </div>

            {invoice ? (
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl font-mono text-xs text-slate-300 space-y-4 max-w-md mx-auto shadow-sm relative overflow-hidden">
                
                {/* Decorative cut circles on edges like real ticket */}
                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-900 border-r border-slate-700 rounded-full transform -translate-y-1/2"></div>
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-900 border-l border-slate-700 rounded-full transform -translate-y-1/2"></div>

                <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-700">
                  <span className="font-bold text-white text-sm uppercase tracking-wider">{t('title')}</span>
                  <p className="text-[10px] text-slate-400">Phnom Penh Headquarters No. 104</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1">*{invoice.type}*</p>
                </div>

                <div className="space-y-1.5 text-[11px] pb-4 border-b border-dashed border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Ref:</span>
                    <span className="text-white font-bold">{invoice.invoice_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date Issued:</span>
                    <span>{invoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest Profile:</span>
                    <span className="text-white font-semibold">{invoice.guest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Identified Room:</span>
                    <span className="text-indigo-400 font-bold">Room {invoice.room}</span>
                  </div>
                </div>

                <div className="space-y-2 pb-4 border-b border-dashed border-slate-700">
                  <div className="flex justify-between text-[11px]">
                    <span>Itemized Lodgement (days x price):</span>
                    <span>{invoice.days} d. x ${invoice.rate}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Stay Lodgement Subtotal:</span>
                    <span className="text-slate-100">${invoice.subtotal}</span>
                  </div>
                  {invoice.utilities && (
                    <div className="flex justify-between font-medium">
                      <span>Util Meter Excess Charges:</span>
                      <span className="text-slate-100">${invoice.utilities}</span>
                    </div>
                  )}
                  {invoice.damages && (
                    <div className="flex justify-between font-medium text-rose-400">
                      <span>Incidental Damages:</span>
                      <span>+${invoice.damages}</span>
                    </div>
                  )}
                  {invoice.discount && (
                    <div className="flex justify-between font-medium text-emerald-400">
                      <span>Sponsor/Partner Discount:</span>
                      <span>-${invoice.discount}</span>
                    </div>
                  )}
                  {invoice.deposit && (
                    <div className="flex justify-between font-medium">
                      <span>Room Entry Safe Deposit:</span>
                      <span className="text-slate-200">${invoice.deposit}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline font-bold text-white text-base">
                  <span>Grand Settle Amount:</span>
                  <span className="text-emerald-400 font-extrabold text-lg">${invoice.total}</span>
                </div>

                <div className="text-center pt-4 text-[10px] text-slate-500 font-medium leading-normal">
                  <p>VAT registered: NO. 01103984-G</p>
                  <p className="mt-1">Thank you for your stay at our guesthouse!</p>
                  <p className="text-indigo-400 uppercase tracking-widest text-[9px] font-bold mt-2">Powered by Laravel 12 API</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <Receipt className="w-12 h-12 text-slate-600 animate-pulse" />
                <div>
                  <span className="text-sm font-semibold text-slate-300 block">No Invoice Generated</span>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Complete check-in or check-out checkout forms. The physical simulated invoice layout will populate here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {invoice && (
            <div className="mt-6 flex justify-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-700 bg-slate-900/60 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-300 transition"
              >
                {t('printInvoice')}
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
