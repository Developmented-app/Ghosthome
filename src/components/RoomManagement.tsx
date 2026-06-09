import React, { useState } from 'react';
import { Room } from '../types';
import { Plus, Trash2, Search, Filter, ShieldAlert, CheckCircle, PenTool, Bed } from 'lucide-react';

interface RoomManagementProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function RoomManagement({ rooms, setRooms, lang, t, triggerToast }: RoomManagementProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new room
  const [roomNo, setRoomNo] = useState('');
  const [roomType, setRoomType] = useState('Single Deluxe');
  const [floor, setFloor] = useState('1st');
  const [capacity, setCapacity] = useState(2);
  const [dailyPrice, setDailyPrice] = useState(25);
  const [monthlyPrice, setMonthlyPrice] = useState(350);

  // Dynamic automatic computation helper
  const handleTypeChange = (type: string) => {
    setRoomType(type);
    if (type === 'Single Deluxe') {
      setCapacity(2);
      setDailyPrice(25);
      setMonthlyPrice(350);
    } else if (type === 'Double VIP') {
      setCapacity(4);
      setDailyPrice(45);
      setMonthlyPrice(550);
    } else if (type === 'Family Suite') {
      setCapacity(6);
      setDailyPrice(75);
      setMonthlyPrice(900);
    } else if (type === 'Penthouse President') {
      setCapacity(8);
      setDailyPrice(150);
      setMonthlyPrice(1800);
    }
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo.trim()) {
      triggerToast(t('validationError'));
      return;
    }
    // Check duplication
    if (rooms.some(r => r.room_no === roomNo.trim())) {
      triggerToast(lang === 'en' ? 'Room number already exists!' : 'លេខបន្ទប់នេះមានរួចហើយ!');
      return;
    }

    const created: Room = {
      id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1,
      room_no: roomNo.trim(),
      type: roomType,
      floor,
      capacity,
      daily_price: dailyPrice,
      monthly_price: monthlyPrice,
      status: 'Available'
    };

    setRooms([...rooms, created]);
    setShowAddModal(false);
    triggerToast(`Room ${created.room_no} [${created.type}] added.`);
    
    // reset
    setRoomNo('');
    setRoomType('Single Deluxe');
    setCapacity(2);
    setDailyPrice(25);
    setMonthlyPrice(350);
  };

  const deleteRoom = (id: number, roomNo: string) => {
    setRooms(rooms.filter(r => r.id !== id));
    triggerToast(lang === 'en' ? `Room ${roomNo} removed.` : `បន្ទប់លេខ ${roomNo} ត្រូវបានលុបចេញ។`);
  };

  const toggleStatus = (id: number) => {
    setRooms(rooms.map(r => {
      if (r.id === id) {
        let nextStatus: Room['status'] = 'Available';
        if (r.status === 'Available') nextStatus = 'Maintenance';
        else if (r.status === 'Maintenance') nextStatus = 'Available';
        else {
          triggerToast(lang === 'en' ? "Occupied or Reserved rooms cannot be set to maintenance directly." : "បន្ទប់កំពុងប្រើប្រាស់ ឬកក់ទុក មិនអាចប្តូរទៅជួសជុលបានទេ");
          return r;
        }
        triggerToast(`Room ${r.room_no} status: ${nextStatus}`);
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  // filter implementation
  const filtered = rooms.filter(r => {
    const matchesSearch = r.room_no.toLowerCase().includes(search.toLowerCase()) || 
                          r.type.toLowerCase().includes(search.toLowerCase()) ||
                          r.floor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    const matchesType = typeFilter === 'All' ? true : r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('roomManagement')}</h2>
          <p className="text-xs text-slate-400">Configure layout styles, manage maintenance status, and view rates.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addRoom')}</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto md:flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500 transition text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter selection */}
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="All" className="text-slate-800">{t('status')}: {t('all')}</option>
              <option value="Available" className="text-slate-800">{t('available')}</option>
              <option value="Occupied" className="text-slate-800">{t('occupied')}</option>
              <option value="Reserved" className="text-slate-800">{t('reserved')}</option>
              <option value="Maintenance" className="text-slate-800">{t('maintenance')}</option>
            </select>
          </div>

          {/* Type filter selection */}
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="All" className="text-slate-800">{t('roomType')}: {t('all')}</option>
              <option value="Single Deluxe" className="text-slate-800">Single Deluxe</option>
              <option value="Double VIP" className="text-slate-800">Double VIP</option>
              <option value="Family Suite" className="text-slate-800">Family Suite</option>
              <option value="Penthouse President" className="text-slate-800">Penthouse President</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Catalog Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(room => (
          <div 
            key={room.id}
            className={`border rounded-2xl p-5 bg-slate-800/20 hover:bg-slate-800/40 transition duration-200 shadow-sm relative overflow-hidden ${
              room.status === 'Available' ? 'border-emerald-500/20' : 
              room.status === 'Occupied' ? 'border-indigo-500/20' :
              room.status === 'Reserved' ? 'border-amber-500/20' : 'border-rose-500/20'
            }`}
          >
            {/* Corner status colored strip */}
            <div className={`absolute top-0 right-0 left-0 h-1.5 ${
              room.status === 'Available' ? 'bg-emerald-500' : 
              room.status === 'Occupied' ? 'bg-indigo-500' :
              room.status === 'Reserved' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></div>

            <div className="flex justify-between items-start mt-2">
              <div>
                <span className="text-xs font-mono font-medium text-slate-400">{room.floor} Floor</span>
                <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">Room {room.room_no}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                room.status === 'Occupied' ? 'bg-indigo-500/10 text-indigo-400' :
                room.status === 'Reserved' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {room.status === 'Available' ? t('available') :
                 room.status === 'Occupied' ? t('occupied') :
                 room.status === 'Reserved' ? t('reserved') : t('maintenance')}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('roomType')}:</span>
                <span className="font-semibold text-indigo-300">{room.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('capacity')}:</span>
                <span className="font-semibold text-slate-200">{room.capacity} Guests max</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">{t('dailyPrice')} / {t('monthlyPrice')}:</span>
                <span className="font-bold text-slate-100">${room.daily_price}/day · ${room.monthly_price}/mo</span>
              </div>
            </div>

            {/* Actions Panel inside Card */}
            <div className="mt-5 pt-3.5 border-t border-slate-700/50 flex justify-between gap-2">
              <button
                onClick={() => toggleStatus(room.id)}
                title="Toggle Maintenance Status"
                className={`flex-1 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                  room.status === 'Maintenance' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {room.status === 'Maintenance' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Set Ready</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Maintenance</span>
                  </>
                )}
              </button>

              <button
                onClick={() => deleteRoom(room.id, room.room_no)}
                className="p-1 px-2.5 rounded-lg border border-slate-700 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition text-xs flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-800/10 border border-slate-700/60 rounded-2xl">
            <p className="text-xs text-slate-400">{t('noRecords')}</p>
          </div>
        )}
      </div>

      {/* Styled Add Room Slide or Modal Dialog Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-4">{t('addRoom')}</h3>
            
            <form onSubmit={handleAddRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('roomNo')} *</label>
                <input 
                  type="text" 
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  placeholder="e.g. 103"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('roomType')}</label>
                  <select 
                    value={roomType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Single Deluxe">Single Deluxe</option>
                    <option value="Double VIP">Double VIP</option>
                    <option value="Family Suite">Family Suite</option>
                    <option value="Penthouse President">Penthouse President</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('floor')}</label>
                  <select 
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="1st">1st Floor</option>
                    <option value="2nd">2nd Floor</option>
                    <option value="3rd">3rd Floor</option>
                    <option value="4th">4th Floor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('capacity')}</label>
                  <input 
                    type="number" 
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Daily ($)</label>
                  <input 
                    type="number" 
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly ($)</label>
                  <input 
                    type="number" 
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    required
                  />
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
