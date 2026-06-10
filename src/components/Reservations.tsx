import React, { useState } from 'react';
import { Reservation, Room } from '../types';
import { Calendar, Plus, Search, HelpCircle, CheckCircle, XCircle, Trash2, Tag, QrCode, Printer, Copy, Check, X, FileText, Lock } from 'lucide-react';

interface ReservationsProps {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function Reservations({ reservations, setReservations, rooms, setRooms, lang, t, triggerToast }: ReservationsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // States for Digital Guest Registration Card & QR
  const [selectedReservationForQr, setSelectedReservationForQr] = useState<Reservation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [registrationSigned, setRegistrationSigned] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  // Form states for bookings
  const [guestName, setGuestName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkin, setCheckin] = useState('2026-06-10');
  const [checkout, setCheckout] = useState('2026-06-15');
  const [status, setStatus] = useState<'Confirmed' | 'Pending'>('Pending');
  const [deposit, setDeposit] = useState(50);

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !selectedRoom) {
      triggerToast(t('validationError'));
      return;
    }

    const created: Reservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      guest_name: guestName.trim(),
      room_no: selectedRoom,
      checkin,
      checkout,
      status,
      deposit
    };

    setReservations([...reservations, created]);

    // Also transition Room Status to 'Reserved' if it doesn't conflict with occupied state
    setRooms(prevRooms => prevRooms.map(r => {
      if (r.room_no === selectedRoom && r.status === 'Available') {
        return { ...r, status: 'Reserved' };
      }
      return r;
    }));

    setShowAddModal(false);
    triggerToast(lang === 'en' ? `Reservation registered for ${created.guest_name} on Room ${created.room_no}` : `បានកក់បន្ទប់សម្រាប់ ${created.guest_name} នៅបន្ទប់ ${created.room_no}`);

    // reset
    setGuestName('');
    setSelectedRoom('');
    setCheckin('2026-06-10');
    setCheckout('2026-06-15');
    setStatus('Pending');
    setDeposit(50);
  };

  const removeBooking = (id: number, gName: string) => {
    setReservations(reservations.filter(r => r.id !== id));
    triggerToast(`Booking for ${gName} removed.`);
  };

  const approveBooking = (id: number) => {
    setReservations(reservations.map(r => {
      if (r.id === id) {
        triggerToast(`Booking status for ${r.guest_name} changed to Confirmed.`);
        return { ...r, status: 'Confirmed' };
      }
      return r;
    }));
  };

  const cancelBooking = (id: number, roomNo: string) => {
    setReservations(reservations.map(r => {
      if (r.id === id) {
        // Return matching room from Reserved to Available
        setRooms(prevRooms => prevRooms.map(rm => rm.room_no === roomNo && rm.status === 'Reserved' ? { ...rm, status: 'Available' } : rm));
        triggerToast(`Booking status for ${r.guest_name} cancelled.`);
        return { ...r, status: 'Cancelled' };
      }
      return r;
    }));
  };

  const filtered = reservations.filter(r => {
    const matchesSearch = r.guest_name.toLowerCase().includes(search.toLowerCase()) || 
                          r.room_no.includes(search);
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('reservations')}</h2>
          <p className="text-xs text-slate-400">Lock down calendar schedules, update reservation phases, and manage deposits.</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => {
              triggerToast(lang === 'en' ? "Preparing printer-friendly PDF..." : "កំពុងរៀបចំការបោះពុម្ព PDF...");
              setTimeout(() => {
                window.print();
              }, 250);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-150 border border-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'en' ? 'Export to PDF' : 'នាំចេញជា PDF'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createBooking')}</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500 transition text-white"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer font-medium"
          >
            <option value="All" className="text-slate-800">{t('status')}: {t('all')}</option>
            <option value="Confirmed" className="text-slate-800">Confirmed</option>
            <option value="Pending" className="text-slate-800">Pending</option>
            <option value="Cancelled" className="text-slate-800">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table Listings layout */}
      <div className="bg-slate-800/20 border border-slate-700/60 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">{t('guestName')}</th>
                <th className="py-4 px-5">{t('roomNo')}</th>
                <th className="py-4 px-5">{t('checkinDate')}</th>
                <th className="py-4 px-5">{t('checkoutDate')}</th>
                <th className="py-4 px-5">{t('deposit')}</th>
                <th className="py-4 px-5">{t('status')}</th>
                <th className="py-4 px-5 text-right no-print">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {filtered.map(booking => {
                const isToday = booking.checkin === new Date().toISOString().split('T')[0];
                return (
                  <tr 
                    key={booking.id} 
                    className={`transition duration-150 ${
                      isToday 
                        ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-amber-500 font-semibold' 
                        : 'hover:bg-slate-800/10'
                    }`}
                  >
                    <td className="py-4 px-5 relative">
                      {isToday && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block">{booking.guest_name}</span>
                        {isToday && (
                          <span className="bg-amber-500/25 text-amber-300 font-bold px-2 py-0.5 rounded-full text-[9px] animate-pulse shrink-0 uppercase tracking-wider flex items-center gap-1 border border-amber-500/20">
                            <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping"></span>
                            <span>Starts Today</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">Scheduled Stayer</span>
                    </td>
                  <td className="py-4 px-5">
                    <span className="bg-indigo-500/10 text-indigo-300 font-bold px-2 py-0.5 rounded text-[11px] border border-indigo-500/10">
                      R-{booking.room_no}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-200 font-medium font-mono">{booking.checkin}</td>
                  <td className="py-4 px-5 text-slate-200 font-medium font-mono">{booking.checkout}</td>
                  <td className="py-4 px-5">
                    <span className="text-emerald-400 font-bold">${booking.deposit}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                      booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                    <td className="py-4 px-5 text-right no-print">
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => {
                          setSelectedReservationForQr(booking);
                          setCopiedLink(false);
                          setRegistrationSigned(false);
                          setSignatureName(booking.guest_name);
                        }}
                        title={lang === 'en' ? "Digital Registration Card QR" : "កូដ QR កាតចុះឈ្មោះឌីជីថល"}
                        className="p-1 px-2 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded transition flex items-center justify-center cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {booking.status === 'Pending' && (
                        <button
                          onClick={() => approveBooking(booking.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      
                      {booking.status !== 'Cancelled' && (
                        <button
                          onClick={() => cancelBooking(booking.id, booking.room_no)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20 font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => removeBooking(booking.id, booking.guest_name)}
                        className="p-1 px-2 border border-slate-700 hover:bg-slate-700/60 rounded text-slate-300 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {t('noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking registration modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4 no-print">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-4">{t('createBooking')}</h3>
            
            <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('guestName')} *</label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('roomNo')} *</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    required
                  >
                    <option value="">-- Choose --</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.room_no} className="text-slate-800">
                        Room {room.room_no} ({room.type} - ${room.daily_price}/day) ({room.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('deposit')} ($)</label>
                  <input 
                    type="number" 
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('checkinDate')} *</label>
                  <input 
                    type="date" 
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('checkoutDate')} *</label>
                  <input 
                    type="date" 
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('status')}</label>
                <div className="flex space-x-3 mt-1.5">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-200 cursor-pointer">
                    <input 
                      type="radio" 
                      name="booking_status" 
                      checked={status === 'Pending'} 
                      onChange={() => setStatus('Pending')}
                    />
                    <span>Pending</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-slate-200 cursor-pointer">
                    <input 
                      type="radio" 
                      name="booking_status" 
                      checked={status === 'Confirmed'} 
                      onChange={() => setStatus('Confirmed')}
                    />
                    <span>Confirmed</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 rounded-lg text-xs font-semibold text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Digital Guest Registration Card & QR Generator Modal */}
      {selectedReservationForQr && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4 py-6 no-print">
          <div className="bg-[#0f172a] border border-indigo-500/35 rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.2)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Background decoration lines */}
            <div className="absolute top-[-80px] left-[-80px] w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header banner */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-800 relative z-10">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Mobile-Friendly Guest Access</span>
                <h3 className="font-extrabold text-white text-lg">Digital Registration Card & QR</h3>
              </div>
              <button 
                onClick={() => setSelectedReservationForQr(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Standard 2-Column Desktop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
              
              {/* Left Column: Digital Copy of Guest Registration Card (7 cols) */}
              <div className="md:col-span-7 bg-[#131e35] border border-slate-700/50 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h4 className="font-extrabold text-xs text-indigo-200 leading-tight">SORYA GUESTHOUSE</h4>
                        <span className="text-[9px] text-slate-400 tracking-wider block font-mono">PHNOM PENH, KH</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-indigo-500/15 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      REG-2026-{selectedReservationForQr.id}
                    </span>
                  </div>

                  {/* Main Title */}
                  <div className="text-center py-1 bg-slate-900/60 rounded-lg border border-slate-800/80 mb-4">
                    <h5 className="text-[10px] uppercase font-bold text-white tracking-widest">Guest Registration Card</h5>
                    <p className="text-[9px] text-slate-400 font-medium">កាតចុះឈ្មោះស្នាក់នៅរបស់ភ្ញៀវ</p>
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-2.5 text-[11px] font-mono leading-none">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase">Guest Name</span>
                        <span className="text-white font-extrabold block mt-1 truncate">{selectedReservationForQr.guest_name}</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-550 block uppercase">Room Number</span>
                        <span className="text-indigo-300 font-extrabold block mt-1">Suite R-{selectedReservationForQr.room_no}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase">Arrival (In)</span>
                        <span className="text-slate-300 font-bold block mt-1">{selectedReservationForQr.checkin}</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-550 block uppercase">Departure (Out)</span>
                        <span className="text-slate-300 font-bold block mt-1">{selectedReservationForQr.checkout}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-550 block uppercase">Security Deposit</span>
                        <span className="text-emerald-400 font-extrabold block mt-1">${selectedReservationForQr.deposit} USD</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-550 block uppercase">Status</span>
                        <span className={`font-extrabold block mt-1 uppercase text-[10px] ${
                          selectedReservationForQr.status === 'Confirmed' ? 'text-emerald-400 animate-pulse' : 'text-amber-550'
                        }`}>{selectedReservationForQr.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions & Signatures disclaimer */}
                  <div className="mt-4 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[9px] text-slate-400 leading-normal space-y-1">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block">Policy Agreements:</span>
                    <p>1. Identifications/passports are visually vetted at check-in counter.</p>
                    <p>2. Strictly no illegal materials, contraband, or smoking inside room units.</p>
                    <p>3. Standard checkout is due before 12:00 PM on departure date.</p>
                  </div>
                </div>

                {/* Simulated Signature Block */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block select-none">Guest Digital Authorization Signature</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationSigned(!registrationSigned);
                        if (!registrationSigned && !signatureName) {
                          setSignatureName(selectedReservationForQr.guest_name);
                        }
                      }}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      {registrationSigned ? 'Clear Signature' : 'Quick Auto-Sign'}
                    </button>
                  </div>

                  {registrationSigned ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/25 p-3 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-150">
                      <div>
                        <span className="font-medium text-[10px] text-slate-400 block font-mono">SIGNED ELECTRONICALLY BY</span>
                        <span className="text-lg text-emerald-400 font-bold italic tracking-wider block drop-shadow-sm font-sans" style={{ fontFamily: 'Georgia, serif' }}>
                          ✍️ {signatureName || selectedReservationForQr.guest_name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="bg-emerald-500/15 text-emerald-400 rounded-full text-[8px] px-2 py-0.5 border border-emerald-500/20 font-bold uppercase tracking-wider">
                          Verified Card
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 mt-1">TIME: 2026-06-09</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-center items-center h-16 cursor-pointer border-dashed hover:border-slate-700 hover:bg-[#090d16] transition"
                         onClick={() => {
                           setRegistrationSigned(true);
                           setSignatureName(selectedReservationForQr.guest_name);
                         }}>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-bold text-slate-305 uppercase tracking-widest">Sign Card digitally</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic QR Generator Pass Card (5 cols) */}
              <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 text-center select-none">
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider self-center">
                  Registration Card QR
                </span>

                <div className="flex justify-center my-1.5">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-300/40 flex items-center justify-center transform transition duration-300 hover:scale-105">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `${window.location.origin}/?view=registration-card&booking_id=${selectedReservationForQr.id}&guest=${encodeURIComponent(selectedReservationForQr.guest_name)}`
                      )}`} 
                      alt={`Booking Card QR Code for ${selectedReservationForQr.guest_name}`} 
                      className="w-36 h-36"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-[13px] tracking-tight">QR Scanner Lock Badge</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                    Have guests scan this QR code with their mobile cameras to view their live booking card receipts instantly, saving paper.
                  </p>
                </div>

                {/* Mini Link Copying tools */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const linkText = `${window.location.origin}/?view=registration-card&booking_id=${selectedReservationForQr.id}`;
                      navigator.clipboard.writeText(linkText);
                      setCopiedLink(true);
                      triggerToast(lang === 'en' ? "Registration card URL Copied!" : "បានចម្លងតំណភ្ជាប់កាតចុះឈ្មោះ!");
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-95 duration-100" />
                        <span>Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Copy registration URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Print Registration Card</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom help desk disclaimer info */}
            <div className="mt-5 pt-3.5 border-t border-slate-800 text-center relative z-10 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Complies with Sorya Privacy Terms & Cambodia Ministry Vetting Norms.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
