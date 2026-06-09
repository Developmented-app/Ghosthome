import React, { useState } from 'react';
import { Reservation, Room } from '../types';
import { Calendar, Plus, Search, HelpCircle, CheckCircle, XCircle, Trash2, Tag } from 'lucide-react';

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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createBooking')}</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
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
                <th className="py-4 px-5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-800/10 transition duration-150">
                  <td className="py-4 px-5">
                    <span className="font-bold text-white block">{booking.guest_name}</span>
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
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-2 text-[10px]">
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
              ))}

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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
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
    </div>
  );
}
