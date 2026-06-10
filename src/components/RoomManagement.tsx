import React, { useState } from 'react';
import { Room, SystemNotification } from '../types';
import { Plus, Trash2, Search, Filter, ShieldAlert, CheckCircle, PenTool, Bed, LayoutGrid, Map, Activity, Circle, Settings2, Calendar, Wrench, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const getRoomLastServicedDate = (roomNo: string) => {
  const mapping: Record<string, { date: string, notes: string }> = {
    '101': { date: '2026-06-08', notes: 'Housekeeping complete' },
    '102': { date: '2026-06-05', notes: 'HVAC filter checked' },
    '201': { date: '2026-06-07', notes: 'Bedding refreshed' },
    '202': { date: '2026-06-08', notes: 'Sanitized inspect clear' },
    '301': { date: '2026-06-04', notes: 'Deep clean major service' },
    '302': { date: '2026-06-06', notes: 'Sanitized & prepped' },
    '401': { date: '2026-06-09', notes: 'Premium VIP refresh' }
  };
  return mapping[roomNo] || { date: '2026-06-08', notes: 'Routine check' };
};

interface RoomManagementProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  notifications?: SystemNotification[];
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function RoomManagement({ rooms, setRooms, notifications, lang, t, triggerToast }: RoomManagementProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Custom interactive states for floor plan
  const [viewMode, setViewMode] = useState<'catalog' | 'floorplan' | 'inventory'>('catalog');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Room Inventory State
  const [roomInventories, setRoomInventories] = useState<Record<string, { name: string; quantity: number; minRequired: number; }[]>>(() => {
    const saved = localStorage.getItem('guest_house_room_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    
    // Default values matched with template rooms
    const defaultInventory: Record<string, { name: string; quantity: number; minRequired: number; }[]> = {};
    const initialRooms = ['101', '102', '201', '202', '301', '302', '401'];
    initialRooms.forEach(rNo => {
      defaultInventory[rNo] = [
        { name: 'Towels', quantity: 4, minRequired: 2 },
        { name: 'Soaps', quantity: 3, minRequired: 2 },
        { name: 'Remote Controls', quantity: 1, minRequired: 1 },
        { name: 'Bed Sheets', quantity: 2, minRequired: 2 },
        { name: 'Toilet Paper', quantity: 5, minRequired: 3 }
      ];
    });

    // Seed some low stock alerts for interactive demo quality!
    if (defaultInventory['102']) {
      defaultInventory['102'][0].quantity = 1; // Towels (low - min is 2)
      defaultInventory['102'][1].quantity = 0; // Soaps (low - min is 2)
    }
    if (defaultInventory['201']) {
      defaultInventory['201'][2].quantity = 0; // Remote missing (low - min is 1)
    }
    if (defaultInventory['302']) {
      defaultInventory['302'][4].quantity = 1; // Toilet Paper low (low - min is 3)
    }
    return defaultInventory;
  });

  const updateRoomInventory = (rNo: string, itemName: string, newQty: number) => {
    setRoomInventories(prev => {
      const updated = { ...prev };
      if (!updated[rNo]) {
        updated[rNo] = [
          { name: 'Towels', quantity: 4, minRequired: 2 },
          { name: 'Soaps', quantity: 3, minRequired: 2 },
          { name: 'Remote Controls', quantity: 1, minRequired: 1 },
          { name: 'Bed Sheets', quantity: 2, minRequired: 2 },
          { name: 'Toilet Paper', quantity: 5, minRequired: 3 }
        ];
      }
      updated[rNo] = updated[rNo].map(item => 
        item.name === itemName ? { ...item, quantity: Math.max(0, newQty) } : item
      );
      localStorage.setItem('guest_house_room_inventory', JSON.stringify(updated));
      return updated;
    });
  };

  const getRoomInventoryStatus = (rNo: string) => {
    const items = roomInventories[rNo] || [];
    if (items.length === 0) return 'OK';
    const lowItems = items.filter(i => i.quantity < i.minRequired);
    return lowItems.length > 0 ? 'LOW' : 'OK';
  };

  // Helper to check if a room has a pending utility task
  const hasPendingUtilityTask = (roomNo: string) => {
    // 1. Check if there is an active warning notification containing "Room {roomNo}"
    const hasWarningNotif = notifications?.some(n => 
      n.type === 'Warning' && 
      n.text.includes(`Room ${roomNo}`)
    );
    if (hasWarningNotif) return true;

    // 2. Default initial condition: Room 102 has a pending utility task 
    // unless the corresponding notification with ID 1 was cleared
    if (roomNo === '102') {
      return notifications ? notifications.some(n => n.id === 1) : true;
    }

    return false;
  };

  const getFloorLabel = (floorStr: string) => {
    if (floorStr === '1st') return lang === 'en' ? '1st Floor - Deluxe Lobby Wings' : 'ជាន់ទី ១ - សេវាផ្នែកខាងមុខ';
    if (floorStr === '2nd') return lang === 'en' ? '2nd Floor - Premium Corridor' : 'ជាន់ទី ២ - បន្ទប់លំដាប់ប្រណីត';
    if (floorStr === '3rd') return lang === 'en' ? '3rd Floor - VIP Executive level' : 'ជាន់ទី ៣ - ជាន់គ្រួសារវីអាយភី';
    if (floorStr === '4th') return lang === 'en' ? '4th Floor - Penthouse Presidential Heights' : 'ជាន់ទី ៤ - បន្ទប់ប្រធានាធិបតី Penthouses';
    return `${floorStr} Floor - Guest Rooms`;
  };

  // Form states for new room
  const [roomNo, setRoomNo] = useState('');
  const [roomType, setRoomType] = useState('Single Deluxe');
  const [floor, setFloor] = useState('1st');
  const [capacity, setCapacity] = useState(2);
  const [dailyPrice, setDailyPrice] = useState(25);
  const [monthlyPrice, setMonthlyPrice] = useState(350);

  // Inventory Filter/Search UI States
  const [invSearch, setInvSearch] = useState('');
  const [invFilterLow, setInvFilterLow] = useState(false);

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
    
    // Initialize room inventory
    setRoomInventories(prev => {
      const updated = { ...prev };
      updated[created.room_no] = [
        { name: 'Towels', quantity: 4, minRequired: 2 },
        { name: 'Soaps', quantity: 3, minRequired: 2 },
        { name: 'Remote Controls', quantity: 1, minRequired: 1 },
        { name: 'Bed Sheets', quantity: 2, minRequired: 2 },
        { name: 'Toilet Paper', quantity: 5, minRequired: 3 }
      ];
      localStorage.setItem('guest_house_room_inventory', JSON.stringify(updated));
      return updated;
    });

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
          {/* View Mode Segment Switcher */}
          <div className="flex bg-slate-900/60 border border-slate-700 p-0.5 rounded-lg text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => { setViewMode('catalog'); setSelectedRoomId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'catalog' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('floorplan'); setSelectedRoomId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'floorplan' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Floor Plan</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('inventory'); setSelectedRoomId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all relative ${
                viewMode === 'inventory' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Inventory Tracking</span>
              {Object.keys(roomInventories).some(rNo => getRoomInventoryStatus(rNo) === 'LOW') && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              )}
              {Object.keys(roomInventories).some(rNo => getRoomInventoryStatus(rNo) === 'LOW') && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rose-600 rounded-full text-[7px] text-white font-black flex items-center justify-center border border-slate-900" title="Low Stocks Alert!">
                  {Object.keys(roomInventories).filter(rNo => getRoomInventoryStatus(rNo) === 'LOW').length}
                </span>
              )}
            </button>
          </div>

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
      {viewMode === 'catalog' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(room => (
            <div 
              key={room.id}
              className={`border rounded-2xl p-5 bg-slate-800/20 hover:bg-slate-800/40 transition duration-200 shadow-sm relative overflow-hidden group ${
                hasPendingUtilityTask(room.room_no) ? 'border-rose-500/50 ring-1 ring-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
                room.status === 'Available' ? 'border-emerald-500/20' : 
                room.status === 'Occupied' ? 'border-indigo-500/20' :
                room.status === 'Reserved' ? 'border-amber-500/20' : 'border-rose-500/20'
              }`}
            >
              {/* Corner status colored strip */}
              <div className={`absolute top-0 right-0 left-0 h-1.5 ${
                hasPendingUtilityTask(room.room_no) ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 animate-pulse' :
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
                  room.status === 'Reserved' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-450'
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

              {/* Maintenance Due Alert with pulsating indicator */}
              {hasPendingUtilityTask(room.room_no) && (
                <div className="mt-3.5 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 animate-pulse">
                  <div className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-rose-450 uppercase tracking-widest leading-none">
                      {lang === 'en' ? 'Maintenance Due' : 'ត្រូវកែលម្អជាបន្ទាន់'}
                    </p>
                    <p className="text-[9px] text-slate-400 leading-tight mt-1">
                      {lang === 'en' ? 'Utility Meter Reading Overdue' : 'ត្រូវការវាស់ស្ទង់ស៊ីទែនទឹកឬភ្លើង'}
                    </p>
                  </div>
                </div>
              )}

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

              {/* Slide-up interactive hover HUD stats panel */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-slate-950/95 border-t border-indigo-500/30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none z-30 flex flex-col justify-center space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                    <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
                    <span>{lang === 'en' ? 'Live Stat Engine' : 'ម៉ាស៊ីនស្ថិតិលម្អិត'}</span>
                  </span>
                  <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono font-black px-1.5 py-0.5 rounded leading-none">
                    Room #{room.room_no}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-tight">
                  <div className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg">
                    <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-bold mb-0.5">{lang === 'en' ? 'Base Rate:' : 'ថ្លៃបន្ទប់គុល:'}</span>
                    <span className="text-white font-extrabold text-[11px]">${room.daily_price}/day</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg">
                    <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-bold mb-0.5">{lang === 'en' ? 'Monthly Base:' : 'ថ្លៃប្រចាំខែ:'}</span>
                    <span className="text-white font-extrabold text-[11px]">${room.monthly_price}/mo</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-slate-300 leading-normal">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">{lang === 'en' ? 'Last Serviced:' : 'ថែទាំចុងក្រោយ:'}</span>
                    <span className="font-extrabold text-slate-100 mt-1 inline-block leading-none">{getRoomLastServicedDate(room.room_no).date}</span>
                    <p className="text-[9px] text-slate-400 leading-tight mt-1 truncate">{getRoomLastServicedDate(room.room_no).notes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-800/10 border border-slate-700/60 rounded-2xl">
              <p className="text-xs text-slate-400">{t('noRecords')}</p>
            </div>
          )}
        </div>
      ) : viewMode === 'floorplan' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Interactive Legend panel */}
          <div className="flex flex-wrap items-center gap-6 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 text-xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Level Map:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-slate-205 font-medium">Vacant / Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse"></span>
              <span className="text-slate-205 font-medium">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
              <span className="text-slate-205 font-medium">Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]"></span>
              <span className="text-slate-205 font-medium">Maintenance</span>
            </div>
            <div className="text-[10px] text-indigo-300 ml-auto font-medium hidden lg:inline">
              👉 Click any room cell to open the Interactive Control HUD
            </div>
          </div>

          {/* Rooms mapped physically group by Floor */}
          {Array.from(new Set(rooms.map(r => r.floor)))
            .sort((a, b) => b.localeCompare(a))
            .map(floorStr => {
              const floorRooms = rooms.filter(r => r.floor === floorStr);
              return (
                <div key={floorStr} className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                      <span className="font-bold text-xs text-slate-300 flex items-center gap-2 uppercase tracking-wide">
                        <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{getFloorLabel(floorStr)}</span>
                      </span>
                      <span className="text-[10px] bg-slate-900 border border-slate-700/60 text-indigo-450 px-2 py-0.5 rounded font-mono font-bold">
                        {floorRooms.length} Rooms
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                      {floorRooms.map(room => {
                        const matched = room.room_no.toLowerCase().includes(search.toLowerCase()) || 
                                        room.type.toLowerCase().includes(search.toLowerCase()) ||
                                        room.floor.toLowerCase().includes(search.toLowerCase());
                        const matchesStatus = statusFilter === 'All' ? true : room.status === statusFilter;
                        const matchesType = typeFilter === 'All' ? true : room.type === typeFilter;
                        const isFilteredOut = !(matched && matchesStatus && matchesType);
                        
                        const isSelected = selectedRoomId === room.id;

                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                            className={`relative rounded-xl p-3.5 text-left border flex flex-col justify-between h-28 transition-all duration-200 outline-none group ${
                              isFilteredOut ? 'opacity-30 saturate-50' : 'opacity-100'
                            } ${
                              isSelected 
                                ? 'ring-2 ring-indigo-500 bg-slate-800/80 scale-[1.04] shadow-lg z-20' 
                                : 'bg-slate-900/40 hover:bg-slate-800/50'
                            } ${
                              hasPendingUtilityTask(room.room_no) ? 'border-rose-500 hover:border-rose-455 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/10 animate-pulse' :
                              room.status === 'Available' ? 'border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.05)]' :
                              room.status === 'Occupied' ? 'border-rose-500/40 hover:border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.05)]' :
                              room.status === 'Reserved' ? 'border-amber-500/40 hover:border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.05)]' :
                              'border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {/* Pulsating Indicator Badge */}
                            {hasPendingUtilityTask(room.room_no) && (
                              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
                              </span>
                            )}

                            <div className="flex justify-between items-start w-full">
                              <div className="flex flex-col">
                                <span className="text-lg font-black text-white tracking-tight">#{room.room_no}</span>
                                {hasPendingUtilityTask(room.room_no) && (
                                  <span className="text-[8px] text-rose-400 font-extrabold uppercase tracking-wide leading-none animate-pulse mt-0.5 whitespace-nowrap">
                                    ⚠️ Maint Due
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  hasPendingUtilityTask(room.room_no) ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-pulse' :
                                  room.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' :
                                  room.status === 'Occupied' ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)] animate-pulse' :
                                  room.status === 'Reserved' ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]' :
                                  'bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.6)]'
                                }`} />
                              </div>
                            </div>

                            <div className="space-y-0.5 mt-auto">
                              <span className="text-[10px] text-indigo-300 block font-semibold truncate leading-none">{room.type}</span>
                              <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold pt-1 border-t border-slate-700/60 leading-none">
                                <span>${room.daily_price}/d</span>
                                <span className="text-[9px] text-slate-500">{room.capacity}👥</span>
                              </div>
                            </div>

                            {/* Hover Tooltip Popup for Floorplan Cells */}
                            <div className="absolute hidden group-hover:block z-35 bottom-full mb-2.5 left-1/2 transform -translate-x-1/2 bg-[#090d16] border border-indigo-500/45 p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-[10px] space-y-1.5 w-44 pointer-events-none transition-all duration-200 leading-normal animate-in fade-in zoom-in-95 duration-100">
                              {/* Pointer arrow down */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-[5px] border-transparent border-t-[#090d16] z-10"></div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-[5px] border-transparent border-t-indigo-500/45 z-0"></div>

                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 font-bold">
                                <span className="text-white">Room #{room.room_no} Stats</span>
                                <span className="text-indigo-400 font-mono font-bold">${room.daily_price}/d</span>
                              </div>
                              <div className="space-y-0.5 font-mono text-[9px] text-slate-300">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">BASE RATE:</span>
                                  <span className="text-white font-extrabold">${room.daily_price}/day</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">MONTHLY:</span>
                                  <span className="text-white font-extrabold">${room.monthly_price}/mo</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-800/80 pt-1 mt-1">
                                  <span className="text-slate-500 font-sans">{lang === 'en' ? 'LAST SERVICE:' : 'សេវាចុងក្រោយ:'}</span>
                                  <span className="text-indigo-300 font-bold font-sans">{getRoomLastServicedDate(room.room_no).date}</span>
                                </div>
                              </div>
                              <div className="text-[8px] text-slate-400 italic pt-0.5 truncate leading-none">
                                {getRoomLastServicedDate(room.room_no).notes}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Detailed Control Desk HUD panel populates beautifully */}
          {selectedRoomId && (() => {
            const selectedRoom = rooms.find(r => r.id === selectedRoomId);
            if (!selectedRoom) return null;
            return (
              <div className="bg-slate-800/80 border border-indigo-500/30 p-5 rounded-2xl space-y-4 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-start border-b border-slate-700 pb-2.5">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{selectedRoom.floor} Floor Workspace Hub</span>
                    <h3 className="text-base font-extrabold text-white">Interactive Control Desk: Room {selectedRoom.room_no}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedRoomId(null)}
                    className="text-xs font-semibold px-2.5 py-1 bg-slate-700 hover:bg-slate-650 rounded-lg text-slate-300 transition"
                  >
                    Close Panel
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                  <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Current Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedRoom.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedRoom.status === 'Occupied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                      selectedRoom.status === 'Reserved' ? 'bg-amber-500/10 text-amber-505 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {selectedRoom.status === 'Available' ? t('available') :
                       selectedRoom.status === 'Occupied' ? t('occupied') :
                       selectedRoom.status === 'Reserved' ? t('reserved') : t('maintenance')}
                    </span>
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Room Type</span>
                    <span className="text-xs font-bold text-indigo-300">{selectedRoom.type}</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Rates</span>
                    <span className="text-xs font-bold text-slate-100">${selectedRoom.daily_price}/day · ${selectedRoom.monthly_price}/mo</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Lodger Limit</span>
                    <span className="text-xs font-bold text-slate-100">{selectedRoom.capacity} Guests authorized</span>
                  </div>
                </div>

                {/* Pending Utility Task Warning Box in Workspace Control HUD */}
                {hasPendingUtilityTask(selectedRoom.room_no) && (
                  <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex items-start gap-3.5 text-xs text-rose-455 animate-pulse my-3">
                    <ShieldAlert className="w-5 h-5 text-rose-405 shrink-0 mt-0.5 animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-rose-400">
                        ⚠️ Needs Immediate Maintenance Check (Utility Meter Overdue)
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {lang === 'en' 
                          ? `Room ${selectedRoom.room_no} is flagged for an overdue utility meter reading task. Ensure water and electricity configurations are registered. Click on 'Utility Billing' to sync settings immediately.`
                          : `បន្ទប់លេខ ${selectedRoom.room_no} ខកខានមិនបានរាយការណ៍ព័ត៌មានទឹកឬភ្លើង។ សូមចុះវាស់ស្ទង់ស៊ីទែន និងបង្កើតវិក្កយបត្រថ្មី។`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick actions direct interactive buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      toggleStatus(selectedRoom.id);
                    }}
                    className="flex-1 min-w-[150px] py-2 bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <PenTool className="w-4 h-4 text-indigo-400" />
                    <span>{selectedRoom.status === 'Maintenance' ? 'Finish Service (Set Vacant)' : 'Simulate Maintenance'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setRooms(rooms.map(r => {
                        if (r.id === selectedRoom.id) {
                          if (r.status === 'Available') {
                            triggerToast(`Room ${r.room_no} simulated directly to: Occupied`);
                            return { ...r, status: 'Occupied' };
                          } else if (r.status === 'Occupied') {
                            triggerToast(`Room ${r.room_no} simulated directly to: Available (Vacant)`);
                            return { ...r, status: 'Available' };
                          } else {
                            triggerToast('First complete maintenance / clear reservation status.');
                            return r;
                          }
                        }
                        return r;
                      }));
                    }}
                    className="flex-1 min-w-[150px] py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Toggle Occupied &harr; Vacant</span>
                  </button>

                  <button
                    onClick={() => {
                      deleteRoom(selectedRoom.id, selectedRoom.room_no);
                      setSelectedRoomId(null);
                    }}
                    className="py-2 px-4 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/25 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Room</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* INVENTORY TRACKING VIEW */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Inventory Health Dashboard Header row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 p-4 border border-slate-700/60 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Currently Monitored Rooms</span>
                <span className="text-2xl font-black text-white font-mono mt-0.5 block">{rooms.length} Rooms</span>
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Settings2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 border border-slate-700/60 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rooms Needing Restock</span>
                <span className={`text-2xl font-black font-mono mt-0.5 block ${
                  Object.keys(roomInventories).filter(r => getRoomInventoryStatus(r) === 'LOW').length > 0 
                    ? 'text-rose-450 animate-pulse' 
                    : 'text-emerald-400 font-semibold'
                }`}>
                  {Object.keys(roomInventories).filter(r => getRoomInventoryStatus(r) === 'LOW').length} Rooms
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${
                Object.keys(roomInventories).filter(r => getRoomInventoryStatus(r) === 'LOW').length > 0 
                  ? 'bg-rose-500/15 border-rose-500/20 text-rose-400 animate-bounce' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 border border-indigo-500/10 rounded-2xl flex flex-col justify-center space-y-2 relative overflow-hidden group">
              <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wide block">Automated Dispatch Room Service</span>
              <button
                type="button"
                onClick={() => {
                  // Replenish all room inventories
                  const updated = { ...roomInventories };
                  let count = 0;
                  rooms.forEach(r => {
                    const rNo = r.room_no;
                    const items = updated[rNo] || [];
                    const hasLow = items.some(i => i.quantity < i.minRequired) || items.length === 0;
                    if (hasLow) {
                      updated[rNo] = [
                        { name: 'Towels', quantity: 4, minRequired: 2 },
                        { name: 'Soaps', quantity: 3, minRequired: 2 },
                        { name: 'Remote Controls', quantity: 1, minRequired: 1 },
                        { name: 'Bed Sheets', quantity: 2, minRequired: 2 },
                        { name: 'Toilet Paper', quantity: 5, minRequired: 3 }
                      ];
                      count++;
                    }
                  });
                  setRoomInventories(updated);
                  localStorage.setItem('guest_house_room_inventory', JSON.stringify(updated));
                  if (count > 0) {
                    triggerToast(`✓ Instantly replenished stocks in all ${count} low stock rooms!`);
                  } else {
                    triggerToast('✓ Inventory is solid. No low stock rooms detected.');
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Restock All Low Rooms</span>
              </button>
            </div>
          </div>

          {/* Filters & Control Row */}
          <div className="bg-slate-800/40 p-4 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-center space-x-3 w-full sm:max-w-xs">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Identify room inventory... (e.g. 102)"
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500 transition text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setInvFilterLow(!invFilterLow)}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer select-none ${
                  invFilterLow 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-extrabold' 
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${invFilterLow ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span>Show Low Stocks Alert Only</span>
                {invFilterLow && (
                  <span className="ml-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {rooms.filter(r => getRoomInventoryStatus(r.room_no) === 'LOW').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  // Simulate client usage / guest using amenities
                  setRoomInventories(prev => {
                    const updated = { ...prev };
                    rooms.forEach(r => {
                      if (Math.random() > 0.4 && updated[r.room_no]) {
                        updated[r.room_no] = updated[r.room_no].map(item => {
                          if (item.name === 'Towels' || item.name === 'Soaps' || item.name === 'Toilet Paper') {
                            const newQty = Math.max(0, item.quantity - Math.floor(Math.random() * 2));
                            return { ...item, quantity: newQty };
                          }
                          return item;
                        });
                      }
                    });
                    localStorage.setItem('guest_house_room_inventory', JSON.stringify(updated));
                    triggerToast('🔔 Simulated guest utility consumption: stocks depleted across multiple rooms.');
                    return updated;
                  });
                }}
                className="py-1.5 px-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer flex items-center gap-1.5"
                title="Deplete item stocks randomly to simulate stay"
              >
                <span>Simulate Log Usage</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms
              .filter(room => {
                const matchesSearch = room.room_no.includes(invSearch);
                const isLow = getRoomInventoryStatus(room.room_no) === 'LOW';
                const matchesLowOnly = invFilterLow ? isLow : true;
                return matchesSearch && matchesLowOnly;
              })
              .map(room => {
                const items = roomInventories[room.room_no] || [
                  { name: 'Towels', quantity: 4, minRequired: 2 },
                  { name: 'Soaps', quantity: 3, minRequired: 2 },
                  { name: 'Remote Controls', quantity: 1, minRequired: 1 },
                  { name: 'Bed Sheets', quantity: 2, minRequired: 2 },
                  { name: 'Toilet Paper', quantity: 5, minRequired: 3 }
                ];
                const status = getRoomInventoryStatus(room.room_no);
                
                return (
                  <div 
                    key={room.id}
                    className={`border rounded-2xl p-5 bg-slate-800/15 transition relative flex flex-col justify-between ${
                      status === 'LOW' 
                        ? 'border-rose-500/40 bg-rose-500/[0.01] shadow-[0_0_15px_rgba(244,63,94,0.06)]' 
                        : 'border-slate-700/70 hover:border-slate-700'
                    }`}
                  >
                    {/* Header bar of room inventory card */}
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">{room.floor} Floor Suite</span>
                        <h4 className="text-base font-extrabold text-white">Room R-{room.room_no}</h4>
                        <span className="text-[9px] text-indigo-400 font-medium">{room.type} ({room.status})</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {status === 'LOW' ? (
                          <span className="bg-rose-500/10 text-rose-400 text-[9px] font-black py-1 px-2.5 rounded-full border border-rose-500/20 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Low Stock Alert</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold py-1 px-2.5 rounded-full border border-emerald-500/20 uppercase tracking-normal flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Stocks Secure</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setRoomInventories(prev => {
                              const updated = { ...prev };
                              updated[room.room_no] = [
                                { name: 'Towels', quantity: 4, minRequired: 2 },
                                { name: 'Soaps', quantity: 3, minRequired: 2 },
                                { name: 'Remote Controls', quantity: 1, minRequired: 1 },
                                { name: 'Bed Sheets', quantity: 2, minRequired: 2 },
                                { name: 'Toilet Paper', quantity: 5, minRequired: 3 }
                              ];
                              localStorage.setItem('guest_house_room_inventory', JSON.stringify(updated));
                              return updated;
                            });
                            triggerToast(`✓ Room ${room.room_no} stocks replenished to standard capacity.`);
                          }}
                          className="text-[9px] font-bold px-2 py-1 bg-slate-900 border border-slate-700 hover:border-slate-500 text-indigo-300 hover:text-white rounded-lg transition cursor-pointer"
                        >
                          Replenish Card
                        </button>
                      </div>
                    </div>

                    {/* Detailed list of items with micro-inputs */}
                    <div className="space-y-4">
                      {items.map(item => {
                        const isLow = item.quantity < item.minRequired;
                        const maxCapacity = item.name === 'Towels' ? 4 : item.name === 'Soaps' ? 3 : item.name === 'Remote Controls' ? 1 : item.name === 'Bed Sheets' ? 2 : 5;
                        const pct = Math.min(100, Math.round((item.quantity / maxCapacity) * 100));

                        return (
                          <div key={item.name} className="flex items-center justify-between gap-4">
                            
                            {/* Left side: name and gauge */}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className={isLow ? 'text-rose-400' : 'text-slate-300'}>
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[11px] font-bold ${
                                    isLow ? 'text-rose-450 font-black' : 'text-slate-100'
                                  }`}>
                                    {item.quantity} / {maxCapacity}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-normal">
                                    (Req: {item.minRequired})
                                  </span>
                                  {isLow && (
                                    <span className="text-[10px] text-rose-500" title="Under minimum required quantity!">
                                      ⚠️
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Progress gauge bar */}
                              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden w-full relative">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    isLow 
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500' 
                                      : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            {/* Right side: controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateRoomInventory(room.room_no, item.name, item.quantity - 1)}
                                className="w-6 h-6 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded flex items-center justify-center font-bold text-xs select-none cursor-pointer transition"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRoomInventory(room.room_no, item.name, item.quantity + 1)}
                                className="w-6 h-6 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded flex items-center justify-center font-bold text-xs select-none cursor-pointer transition"
                              >
                                +
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* Quick status bottom guide */}
                    <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 italic">
                      Standard loadout: 4 Towels, 3 Soaps, 1 Remote, 2 Sheet sets, 5 Toilet paper rolls.
                    </div>

                  </div>
                );
              })}

            {rooms.filter(room => {
              const matchesSearch = room.room_no.includes(invSearch);
              const isLow = getRoomInventoryStatus(room.room_no) === 'LOW';
              const matchesLowOnly = invFilterLow ? isLow : true;
              return matchesSearch && matchesLowOnly;
            }).length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-800/10 border border-slate-700/65 rounded-2xl space-y-1.5">
                <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No rooms match your specific inventory filter parameters.</p>
                <button
                  type="button"
                  onClick={() => { setInvSearch(''); setInvFilterLow(false); }}
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>

        </div>
      )}

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
