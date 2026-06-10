import React, { useState, useMemo } from 'react';
import { Room, Reservation, Guest } from '../types';
import { 
  Building, 
  Map, 
  Layers, 
  Bed, 
  Info, 
  Calendar, 
  ShieldCheck, 
  User, 
  Settings, 
  Clock, 
  Wrench, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  DollarSign,
  PlusCircle,
  HelpCircle,
  Power,
  Thermometer,
  Zap,
  Sun,
  Wind
} from 'lucide-react';

interface FloorMapProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  guests: Guest[];
  lang: 'en' | 'kh' | 'vi' | 'ch' | 'jp';
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
}

export default function FloorMap({
  rooms,
  setRooms,
  reservations,
  setReservations,
  guests,
  lang,
  t,
  triggerToast,
  setActiveTab,
  theme
}: FloorMapProps) {
  // Current active floor in visualization
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  // Currently clicked / selected room on the map
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  
  // Hovered room status for quick preview HUD
  const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);

  // Status filtering in Floor Map header
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Quick form state inside selected room action pane to assign booking or edit
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newRoomStatus, setNewRoomStatus] = useState<'Available' | 'Occupied' | 'Reserved' | 'Maintenance'>('Available');

  // Localized label dictionary for custom floor map terms
  const mapT = {
    en: {
      allFloors: "All Floors",
      floor1: "1st Floor - Lobby & Reception Wings",
      floor2: "2nd Floor - Premium Corridors",
      floor3: "3rd Floor - VIP Executive Level",
      floor4: "4th Floor - Penthouse Heights",
      statusOverview: "Interactive Floor Status Overview",
      hoverTip: "Hover over rooms to preview stats. Click for executive action HUD.",
      status: "Status",
      type: "Type",
      capacity: "Capacity",
      dailyPrice: "Daily Price",
      monthlyPrice: "Monthly Price",
      currentOccupant: "Active Occupant",
      noCurrentOccupant: "No guest checked-in currently",
      upcomingReservations: "Upcoming Reservations",
      noUpcomingReservations: "No pending reservations found",
      checkInDate: "Check-In Date",
      checkOutDate: "Check-Out Date",
      actions: "Control Desk Actions",
      bookRoom: "Book Room",
      checkIn: "Check-In Portal",
      changeStatus: "Override Status",
      jumpToRes: "Jump to Reservations Hub",
      saveOverride: "Save Status Override",
      statusUpdated: "Room status updated successfully!",
      gridLegend: "Visual Blueprint Legend",
      oceanviewTitle: "Ocean & Garden View",
      corridor: "Central Atrium Corridor",
      elevator: "Main elevator and stairs shaft",
      vipSuiteHint: "Equipped with custom mini-bar & private lounge.",
      maintAlert: "Scheduled maintenance in progress."
    },
    kh: {
      allFloors: "គ្រប់ជាន់ទាំងអស់",
      floor1: "ជាន់ទី ១ - សេវាផ្នែកខាងមុខ & បន្ទប់ទទួលភ្ញៀវ",
      floor2: "ជាន់ទី ២ - បន្ទប់លំដាប់ប្រណីត",
      floor3: "ជាន់ទី ៣ - ជាន់គ្រួសារលំដាប់វីអាយភី",
      floor4: "ជាន់ទី ៤ - បន្ទប់ប្រធានាធិបតី Penthouses",
      statusOverview: "ទិដ្ឋភាពទូទៅនៃផែនទីជាន់បន្ទប់",
      hoverTip: "ដាក់កណ្ដុរលើបន្ទប់ដើម្បីមើលលម្អិត។ ចុចលើបន្ទប់ដើម្បីបញ្ជាដោះស្រាយភ្លាមៗ។",
      status: "ស្ថានភាព",
      type: "ប្រភេទបន្ទប់",
      capacity: "ចំណុះមនុស្ស",
      dailyPrice: "តម្លៃប្រចាំថ្ងៃ",
      monthlyPrice: "តម្លៃប្រចាំខែ",
      currentOccupant: "ភ្ញៀវស្នាក់នៅបច្ចុប្បន្ន",
      noCurrentOccupant: "មិនទាន់មានភ្ញៀវចូលស្នាក់នៅទេ",
      upcomingReservations: "ការកក់ទុកបន្តបន្ទាប់",
      noUpcomingReservations: "មិនមានការកក់ទុកបន្តទេ",
      checkInDate: "ថ្ងៃចូលស្នាក់នៅ",
      checkOutDate: "ថ្ងៃចាកចេញ",
      actions: "ផ្ទាំងបញ្ជាគ្របគ្រងបន្ទប់",
      bookRoom: "កក់បន្ទប់នេះ",
      checkIn: "ចូលស្នាក់នៅ (Check-In)",
      changeStatus: "ផ្លាស់ប្តូរស្ថានភាពផ្ទាល់ខ្លួន",
      jumpToRes: "ទៅកាន់ផ្នែកកក់បន្ទប់",
      saveOverride: "រក្សាទុកការផ្លាស់ប្តូរ",
      statusUpdated: "បានផ្លាស់ប្តូរស្ថានភាពបន្ទប់ដោយជោគជ័យ!",
      gridLegend: "សញ្ញាសំគាល់ប្លង់បន្ទប់",
      oceanviewTitle: "ទេសភាពសមុទ្រ និងសួនច្បារ",
      corridor: "ច្រករបៀងកណ្តាល",
      elevator: "ជណ្ដើរយន្ត និង ជណ្តើរជើង",
      vipSuiteHint: "បំពាក់ដោយមីនីបារ និងបន្ទប់ទទួលភ្ញៀវផ្ទាល់ខ្លួន។",
      maintAlert: "កំពុងស្ថិតក្នុងការជួសជុល និងថែទាំ។"
    },
    vi: {
      allFloors: "Tất cả các tầng",
      floor1: "Tầng 1 - Sảnh lễ tân & Tiếp đón",
      floor2: "Tầng 2 - Hành lang cao cấp",
      floor3: "Tầng 3 - Phòng Executive VIP",
      floor4: "Tầng 4 - Căn hộ Áp mái Penthouse",
      statusOverview: "Sơ Đồ Bố Trí Phòng Theo Tầng",
      hoverTip: "Di chuột qua phòng để xem thông tin. Nhấp chọn để mở bảng điều khiển quản lý.",
      status: "Trạng thái",
      type: "Loại phòng",
      capacity: "Sức chứa",
      dailyPrice: "Giá ngày",
      monthlyPrice: "Giá tháng",
      currentOccupant: "Khách đang ở",
      noCurrentOccupant: "Hiện tại không có khách lưu trú",
      upcomingReservations: "Các lượt đặt trước sắp tới",
      noUpcomingReservations: "Không có lượt đặt trước nào",
      checkInDate: "Ngày nhận phòng",
      checkOutDate: "Ngày trả phòng",
      actions: "Bảng thao tác quản trị viên",
      bookRoom: "Đặt phòng nay",
      checkIn: "Giao diện Nhận phòng",
      changeStatus: "Điều chỉnh trạng thái",
      jumpToRes: "Chuyển sang Quản lý đặt phòng",
      saveOverride: "Lưu thay đổi trạng thái",
      statusUpdated: "Cập nhật trạng thái phòng thành công!",
      gridLegend: "Ký Hiệu Sơ Đồ Thiết Kế",
      oceanviewTitle: "Hướng nhìn Sân vườn & Biển",
      corridor: "Hành lang thông tầng",
      elevator: "Thang máy & Lối thoát hiểm",
      vipSuiteHint: "Trang bị tủ rượu mini-bar và phòng khách riêng tư.",
      maintAlert: "Hệ thống đang được bảo trì định kỳ."
    },
    ch: {
      allFloors: "所有楼层",
      floor1: "1 楼 - 前台大厅与接待侧翼",
      floor2: "2 楼 - 高级走廊客房",
      floor3: "3 楼 - 行政 VIP 专属楼层",
      floor4: "4 楼 - 阁楼总统套房",
      statusOverview: "楼层客房实时平面图",
      hoverTip: "悬停在客房上以快速预览。单击可打开管理控制面板。",
      status: "状态",
      type: "房型",
      capacity: "容纳人数",
      dailyPrice: "每日房价",
      monthlyPrice: "每月房价",
      currentOccupant: "当前住客",
      noCurrentOccupant: "当前没有住客登记入驻",
      upcomingReservations: "后续预订计划",
      noUpcomingReservations: "未发现任何待确认预订",
      checkInDate: "入住日期",
      checkOutDate: "退房日期",
      actions: "客房调度操作台",
      bookRoom: "客房预订",
      checkIn: "办理入住",
      changeStatus: "强制修改客房状态",
      jumpToRes: "跳转至预订管理模块",
      saveOverride: "保存客房状态修改",
      statusUpdated: "房间状态强制更新成功！",
      gridLegend: "平面设计制图图例",
      oceanviewTitle: "海景与后花园朝向",
      corridor: "中庭主走廊",
      elevator: "主电梯及安全通道楼梯",
      vipSuiteHint: "配备专属迷你吧及私人会客休息区。",
      maintAlert: "房间正在进行例行维护与深度清洁。"
    },
    jp: {
      allFloors: "すべての階層",
      floor1: "1階 - ロビー＆レセプションエリア",
      floor2: "2階 - プレミアムゲストルーム",
      floor3: "3階 - エグゼクティブ VIP フロア",
      floor4: "4階 - ペントハウス ロイヤルスイート",
      statusOverview: "インタラクティブ・フロアマップ",
      hoverTip: "部屋にマウスを乗せてプレビュー。クリックでコントロールHUDを開きます。",
      status: "状態",
      type: "客室タイプ",
      capacity: "収容人数",
      dailyPrice: "日帰り価格",
      monthlyPrice: "月極価格",
      currentOccupant: "ご滞在中のゲスト",
      noCurrentOccupant: "現在チェックイン中の顧客はいません",
      upcomingReservations: "今後の予約リスト",
      noUpcomingReservations: "今後の保留中の予約はありません",
      checkInDate: "チェックイン日",
      checkOutDate: "チェックアウト日",
      actions: "コントロールデスクの操作",
      bookRoom: "部屋を予約する",
      checkIn: "チェックイン手続き",
      changeStatus: "ステータスの手動変更",
      jumpToRes: "予約ダッシュボードへ移動",
      saveOverride: "変更を保存する",
      statusUpdated: "客室ステータスを更新しました！",
      gridLegend: "フロア設計記号一覧",
      oceanviewTitle: "オーシャン＆ガーデンビュー",
      corridor: "中央アトリウム通路",
      elevator: "中央エレベーター＆アクセス階段タワー",
      vipSuiteHint: "ウェルカム冷蔵庫ミニバーとプライベートサロンを完備。",
      maintAlert: "定期設備メンテナンス作業を実施中。"
    }
  };

  const currentT = mapT[lang] || mapT.en;

  // Compute all unique floors
  const floors = useMemo(() => {
    const list = Array.from(new Set(rooms.map(r => r.floor)));
    return list.sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  // Filtered rooms to display on maps
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesFloor = (selectedFloor === 'All' || room.floor === selectedFloor);
      const matchesStatus = (statusFilter === 'All' || room.status === statusFilter);
      return matchesFloor && matchesStatus;
    });
  }, [rooms, selectedFloor, statusFilter]);

  // Selected Room Object
  const selectedRoom = useMemo(() => {
    if (selectedRoomId === null) return null;
    return rooms.find(r => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  // Compute currently checked in guest for a room based on active reservations that matches dates
  const activeReservationForRoom = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return reservations.find(res => {
      if (res.status === 'Cancelled') return false;
      const roomNoOfSel = selectedRoom?.room_no;
      if (!roomNoOfSel || res.room_no !== roomNoOfSel) return false;
      
      // If check-in is today or before AND checkout has not passed
      return res.checkin <= todayStr && res.checkout >= todayStr;
    }) || null;
  }, [reservations, selectedRoom]);

  // Future reservations list for the selected room
  const futureReservationsForRoom = useMemo(() => {
    if (!selectedRoom) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    return reservations
      .filter(res => res.room_no === selectedRoom.room_no && res.status !== 'Cancelled' && res.checkin > todayStr)
      .sort((a, b) => a.checkin.localeCompare(b.checkin));
  }, [reservations, selectedRoom]);

  // Get dynamic status badges styling
  const getStatusStyle = (status: Room['status']) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          text: 'text-emerald-400',
          shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          label: t('available')
        };
      case 'Occupied':
        return {
          bg: 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400 animate-pulse',
          text: 'text-rose-400',
          shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
          label: t('occupied')
        };
      case 'Reserved':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          text: 'text-amber-400',
          shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          label: t('reserved')
        };
      case 'Maintenance':
        return {
          bg: 'bg-slate-700/20 hover:bg-slate-700/30 border-slate-600/40 text-slate-300',
          dot: 'bg-slate-550',
          text: 'text-slate-400',
          shadow: 'shadow-none',
          label: t('maintenance')
        };
    }
  };

  const handleStatusOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoom.id) {
        return { ...r, status: newRoomStatus };
      }
      return r;
    }));

    setIsEditingStatus(false);
    triggerToast(`✓ Room ${selectedRoom.room_no} override: set to ${newRoomStatus}.`);
  };

  const toggleSmartField = (roomId: number, field: 'energy_saver' | 'auto_ac' | 'smart_lights') => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const currentVal = !r[field];
        const fieldName = field === 'energy_saver' ? 'Energy Saver' : field === 'auto_ac' ? 'Auto-AC' : 'Smart Lights';
        triggerToast(`🔌 Room #${r.room_no}: ${fieldName} set to ${currentVal ? 'Active (ON)' : 'Inactive (OFF)'}`);
        return { ...r, [field]: currentVal };
      }
      return r;
    }));
  };

  const adjustAcTemp = (roomId: number, targetTemp: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const currentTmp = r.ac_temp || 24;
        const finalTemp = Math.max(16, Math.min(30, targetTemp));
        triggerToast(`🌡️ Room #${r.room_no}: Target AC temperature set to ${finalTemp}°C`);
        return { ...r, ac_temp: finalTemp };
      }
      return r;
    }));
  };

  return (
    <div id="floor-map-viz-component" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Dynamic Header Metrics Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('available'), count: rooms.filter(r => r.status === 'Available').length, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20', icon: Building },
          { label: t('occupied'), count: rooms.filter(r => r.status === 'Occupied').length, color: 'border-rose-500/30 text-rose-400 bg-rose-950/20', icon: User },
          { label: t('reserved'), count: rooms.filter(r => r.status === 'Reserved').length, color: 'border-amber-500/30 text-amber-400 bg-amber-950/20', icon: Calendar },
          { label: t('maintenance'), count: rooms.filter(r => r.status === 'Maintenance').length, color: 'border-slate-500/30 text-slate-400 bg-slate-800/10', icon: Wrench }
        ].map((met, index) => {
          const IconC = met.icon;
          return (
            <div key={index} className={`border p-4 rounded-2xl flex items-center justify-between shadow-sm ${met.color}`}>
              <div>
                <span className="text-[10px] font-bold font-mono uppercase text-slate-400 block">{met.label}</span>
                <span className="text-xl font-black tracking-tight">{met.count} <span className="text-xs font-normal text-slate-500">Rooms</span></span>
              </div>
              <IconC className="w-5 h-5 opacity-70 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Primary Workspace Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FLOOR BLUEPRINT VISUALIZER: Col Span 2 */}
        <div id="blueprint-visualizer-main" className="lg:col-span-2 bg-[#111c30]/50 border border-slate-750 p-6 rounded-2xl flex flex-col space-y-6">
          
          {/* Controls Belt */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <h2 className="text-md font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
                <Map className="w-5 h-5 text-indigo-400" />
                <span>{currentT.statusOverview}</span>
              </h2>
              <p className="text-[11px] text-slate-400">{currentT.hoverTip}</p>
            </div>

            {/* Dynamic Status Filters & Operations */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/75 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer focus:border-indigo-505"
              >
                <option value="All">-- {lang === 'en' ? 'Filter Status' : 'ស្ថានភាពទាំងអស់'} --</option>
                <option value="Available">{t('available')}</option>
                <option value="Occupied">{t('occupied')}</option>
                <option value="Reserved">{t('reserved')}</option>
                <option value="Maintenance">{t('maintenance')}</option>
              </select>
            </div>
          </div>

          {/* Floor Navigation Row */}
          <div className="flex bg-[#0a0f1d] p-1 rounded-xl border border-slate-800 shrink-0 select-none overflow-x-auto max-w-full">
            <button
              onClick={() => { setSelectedFloor('All'); setSelectedRoomId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer whitespace-nowrap ${
                selectedFloor === 'All' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 {currentT.allFloors}
            </button>
            {floors.map(fl => (
              <button
                key={fl}
                onClick={() => { setSelectedFloor(fl); setSelectedRoomId(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer whitespace-nowrap ${
                  selectedFloor === fl ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {fl} {lang === 'en' ? 'Floor' : 'ជាន់'}
              </button>
            ))}
          </div>

          {/* Graphical Map Representation Area */}
          <div className="space-y-8">
            {floors
              .filter(fl => selectedFloor === 'All' || fl === selectedFloor)
              .map(floorVal => {
                const floorRooms = rooms.filter(r => r.floor === floorVal);
                
                // Detailed label header for this floor
                let floorDescription = '';
                if (floorVal === '1st') floorDescription = currentT.floor1;
                else if (floorVal === '2nd') floorDescription = currentT.floor2;
                else if (floorVal === '3rd') floorDescription = currentT.floor3;
                else if (floorVal === '4th') floorDescription = currentT.floor4;

                return (
                  <div key={floorVal} className="space-y-4">
                    {/* Floor bar and decoration */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-[#0a0f1d] px-3.5 py-1.5 rounded-lg border border-slate-850">
                        <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-[11px] font-black tracking-wide font-mono uppercase text-indigo-300">
                          {floorVal} {lang === 'en' ? 'Floor Wings' : 'ការិយាល័យ'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-bold tracking-tight truncate shrink">
                        {floorDescription}
                      </span>
                      <div className="flex-1 h-px bg-slate-800/80"></div>
                    </div>

                    {/* PHYSICAL BLUEPRINT GRID MAPPING DESIGN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left Side: Rooms Loop */}
                      <div className="grid grid-cols-2 gap-4">
                        {floorRooms.map(room => {
                          const isSelected = selectedRoomId === room.id;
                          const isHovered = hoveredRoomId === room.id;
                          const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
                          const stS = getStatusStyle(room.status);

                          return (
                            <div key={room.id} className="relative z-10">
                              <button
                                type="button"
                                onMouseEnter={() => setHoveredRoomId(room.id)}
                                onMouseLeave={() => setHoveredRoomId(null)}
                                onClick={() => {
                                  setSelectedRoomId(room.id === selectedRoomId ? null : room.id);
                                  setNewRoomStatus(room.status);
                                  setIsEditingStatus(false);
                                }}
                                className={`w-full text-left rounded-2xl border p-4 h-32 flex flex-col justify-between transition-all duration-300 relative overflow-hidden cursor-pointer group ${
                                  !matchesStatus ? 'opacity-25 saturate-50' : 'opacity-100'
                                } ${stS.bg} ${stS.shadow} ${
                                  isSelected 
                                    ? 'ring-2 ring-indigo-500 scale-[1.03] z-10 bg-indigo-950/20 shadow-md' 
                                    : 'bg-[#0a0f1d]/40'
                                }`}
                              >
                                {/* Vector Floor Blueprint Lines inside each cell */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none select-none z-0">
                                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="0" y1="20" x2="100%" y2="20" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="20" y1="0" x2="20" y2="100%" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
                                    <circle cx="85%" cy="30" r="15" fill="none" stroke="white" strokeWidth="1" />
                                  </svg>
                                </div>

                                {/* Room Header */}
                                <div className="flex justify-between items-start w-full relative z-10">
                                  <div>
                                    <span className="text-[10px] font-bold font-mono tracking-wider text-slate-500 block uppercase">
                                      ROOM
                                    </span>
                                    <span className="text-xl font-black text-white leading-none">
                                      #{room.room_no}
                                    </span>
                                  </div>
                                  <span className={`w-2.5 h-2.5 rounded-full ${stS.dot} shadow-[0_0_8px_currentColor]`} />
                                </div>

                                {/* Room Footing */}
                                <div className="space-y-1 mt-auto relative z-10">
                                  <span className="text-[10px] font-bold text-slate-400 block truncate group-hover:text-white transition-colors">
                                    {room.type}
                                  </span>
                                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-800/80 pt-1">
                                    <span className="text-indigo-400 font-mono">${room.daily_price}/d</span>
                                    <span>{room.capacity}👥 Max</span>
                                  </div>
                                </div>

                                {/* Smart hover tooltip badge in grid cell */}
                                {isHovered && (
                                  <div className="absolute top-2 right-2 bg-indigo-650 text-white rounded-md text-[9px] px-1.5 py-0.5 font-bold flex items-center gap-1 shadow-sm select-none">
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>EXAMINE</span>
                                  </div>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Side: Architectural Blueprint Section for the Floor */}
                      <div className="bg-[#090e18] rounded-2xl border border-slate-850 p-4 font-mono text-[10px] text-slate-400 flex flex-col justify-between h-32 select-none relative overflow-hidden">
                        {/* Blueprint decorative graph paper matrix pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px] opacity-20 pointer-events-none"></div>
                        
                        <div className="space-y-1.5 relative z-10">
                          <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              <span>Blueprint Sector {floorVal}X</span>
                            </span>
                            <span className="font-sans text-[8px] italic text-slate-500">2026 Sys Config</span>
                          </div>
                          
                          <div className="space-y-1 text-slate-400">
                            <div className="flex justify-between">
                              <span>S-WEST WING:</span>
                              <span className="text-emerald-400 font-sans font-bold">{currentT.oceanviewTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CENTRAL ATRIUM:</span>
                              <span className="text-slate-300 font-sans font-bold">{currentT.corridor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ACCESSIBILITY:</span>
                              <span className="text-indigo-300 font-sans font-bold">{currentT.elevator}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-[8px] text-slate-500 italic mt-auto border-t border-slate-900 pt-1 truncate relative z-10">
                          {floorVal === '3rd' || floorVal === '4th' ? currentT.vipSuiteHint : 'Standard fire sprinkler zone verified.'}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
          </div>

          {/* Visual Blueprint Legend Bar */}
          <div className="border-t border-slate-800/90 pt-4 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-indigo-400 font-mono flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentT.gridLegend}:</span>
            </span>
            <div className="flex flex-wrap gap-3.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-[11px]">{t('available')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="font-medium text-[11px]">{t('occupied')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-medium text-[11px]">{t('reserved')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span className="font-medium text-[11px]">{t('maintenance')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* SELECTED ROOM ACTIONS DESK: Col Span 1 */}
        <div id="interactive-actions-panel" className="bg-[#111c30]/50 border border-slate-750 p-6 rounded-2xl flex flex-col space-y-6">
          
          {selectedRoom ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Header Info Banner */}
              <div className="flex items-center gap-3.5 border-b border-slate-800/85 pb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold shadow-inner text-lg">
                  #{selectedRoom.room_no}
                </div>
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-wider leading-none">
                    {lang === 'en' ? 'Guesthouse Desk Control' : 'ផ្ទាំងព័ត៌មានលម្អិតបន្ទប់'}
                  </h3>
                  <span className="text-[10px] text-indigo-300 font-bold block mt-1 uppercase">
                    {selectedRoom.type}
                  </span>
                </div>
              </div>

              {/* Room Metadata Matrix Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#0a0f1d] p-4 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-300 leading-relaxed">
                <div>
                  <span className="text-slate-550 block uppercase tracking-wider text-[9px] font-bold">
                    {lang === 'en' ? 'FLOOR LEVEL' : 'ជាន់ស្នាក់នៅ'}
                  </span>
                  <span className="text-white font-extrabold text-xs">{selectedRoom.floor} Floor</span>
                </div>
                <div>
                  <span className="text-slate-550 block uppercase tracking-wider text-[9px] font-bold">
                    {lang === 'en' ? 'MAX CAPACITY' : 'ចំណុះមនុស្ស'}
                  </span>
                  <span className="text-white font-extrabold text-xs">{selectedRoom.capacity} Guests</span>
                </div>
                <div className="pt-2.5 border-t border-slate-900 mt-2.5">
                  <span className="text-slate-550 block uppercase tracking-wider text-[9px] font-bold">
                    {lang === 'en' ? 'DAILY PRICE' : 'តម្លៃប្រចាំថ្ងៃ'}
                  </span>
                  <span className="text-emerald-400 font-extrabold text-xs">${selectedRoom.daily_price}/day</span>
                </div>
                <div className="pt-2.5 border-t border-slate-900 mt-2.5">
                  <span className="text-slate-550 block uppercase tracking-wider text-[9px] font-bold">
                    {lang === 'en' ? 'MONTHLY PRICE' : 'តម្លៃប្រចាំខែ'}
                  </span>
                  <span className="text-indigo-400 font-extrabold text-xs">${selectedRoom.monthly_price}/month</span>
                </div>
              </div>

              {/* ACTIVE STAY OCCUPANT PORTLET */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                  👤 {currentT.currentOccupant}
                </span>

                {activeReservationForRoom ? (
                  <div className="bg-rose-500/5 rounded-xl border border-rose-500/20 p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-rose-500/10 pb-1.5">
                      <span className="text-xs font-black text-rose-300">
                        {activeReservationForRoom.guest_name}
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded uppercase">
                        {lang === 'en' ? 'Checked-In' : 'កំពុងស្នាក់នៅ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300 leading-normal">
                      <div>
                        <span className="text-slate-500 block text-[9px]">DEPOSIT:</span>
                        <span className="text-yellow-400 font-bold">${activeReservationForRoom.deposit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">RESERVATION ID:</span>
                        <span className="text-slate-400">#{activeReservationForRoom.id}</span>
                      </div>
                      <div className="col-span-2 mt-1 border-t border-rose-500/10 pt-1">
                        <span className="text-slate-500 block text-[9px]">STAY RESIDENCE WINDOW:</span>
                        <span className="text-indigo-300 font-semibold">{activeReservationForRoom.checkin} → {activeReservationForRoom.checkout}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0a0f1d] p-3 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic py-5">
                    {currentT.noCurrentOccupant}
                  </div>
                )}
              </div>

              {/* UPCOMING FUTURE BOOKINGS */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                  📅 {currentT.upcomingReservations}
                </span>

                {futureReservationsForRoom.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {futureReservationsForRoom.map((futureRes, fidx) => (
                      <div key={fidx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[10px] leading-relaxed flex items-center justify-between">
                        <div>
                          <span className="font-black text-slate-200 block truncate max-w-36">{futureRes.guest_name}</span>
                          <span className="text-slate-400 font-sans tracking-wide">{futureRes.checkin} → {futureRes.checkout}</span>
                        </div>
                        <div className="text-right">
                          <span className="bg-amber-600 text-white rounded text-[8px] font-bold px-1.5 py-0.5 uppercase block font-mono">
                            Reserved
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 block mt-1">Res #{futureRes.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0a0f1d] p-3 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic py-5">
                    {currentT.noUpcomingReservations}
                  </div>
                )}
              </div>

              {/* SMART ROOM COMFORT CONTROL INTERFACE */}
              <div className="space-y-3.5 border-t border-slate-800/85 pt-4">
                <span className="text-[10px] text-indigo-300 uppercase font-mono font-bold tracking-wide block flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>{lang === 'en' ? 'Smart Room Controls' : 'បញ្ជាឧបករណ៍វៃឆ្លាត'}</span>
                </span>

                <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-4 space-y-3.5">
                  
                  {/* Energy Saver Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Power className={`w-3.5 h-3.5 ${selectedRoom.energy_saver ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold text-slate-200">
                          {lang === 'en' ? 'Energy Saver' : 'របៀបសន្សំសំចៃភ្លើង'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        {lang === 'en' ? 'Automatic power shutting on guest exit' : 'កាត់ផ្តាច់ចរន្តអគ្គិសនីស្វ័យប្រវត្តពេលចេញក្រៅ'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSmartField(selectedRoom.id, 'energy_saver')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedRoom.energy_saver ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                      style={{ backgroundColor: selectedRoom.energy_saver ? '#059669' : '#334155' }}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          selectedRoom.energy_saver ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Smart Lights Toggle */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-900 pt-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Sun className={`w-3.5 h-3.5 ${selectedRoom.smart_lights ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold text-slate-200">
                          {lang === 'en' ? 'Smart Ambient Lights' : 'ភ្លើងបំភ្លឺបន្ទប់វៃឆ្លាត'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        {lang === 'en' ? 'Toggled cozy lighting presets remotely' : 'បញ្ជាបើកបិទភ្លើងបន្ទប់ពីចម្ងាយ'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSmartField(selectedRoom.id, 'smart_lights')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedRoom.smart_lights ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      style={{ backgroundColor: selectedRoom.smart_lights ? '#d97706' : '#334155' }}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          selectedRoom.smart_lights ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto-AC Control Column */}
                  <div className="space-y-3 border-t border-slate-900 pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Wind className={`w-3.5 h-3.5 ${selectedRoom.auto_ac ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="text-xs font-bold text-slate-200">
                            {lang === 'en' ? 'Smart Auto-AC' : 'ម៉ាស៊ីនត្រជាក់ស្វ័យប្រវត្ត'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal">
                          {lang === 'en' ? 'Regulate efficiency via real-time climate telemetry' : 'រក្សាសីតុណ្ហភាពបន្ទប់ឲ្យសមស្របដោយស្វ័យប្រវត្ត'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSmartField(selectedRoom.id, 'auto_ac')}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          selectedRoom.auto_ac ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                        style={{ backgroundColor: selectedRoom.auto_ac ? '#4f46e5' : '#334155' }}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            selectedRoom.auto_ac ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* AC TEMPERATURE ADJUSTMENT SLIDER */}
                    {selectedRoom.auto_ac && (
                      <div className="bg-slate-950/85 p-2.5 rounded-lg border border-indigo-950/50 flex flex-col gap-2 animate-in slide-in-from-top-1 duration-150">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-indigo-455" />
                            <span>Target Climate</span>
                          </span>
                          <span className="text-xs font-black text-white font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                            {selectedRoom.ac_temp || 24}°C
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjustAcTemp(selectedRoom.id, (selectedRoom.ac_temp || 24) - 1)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg flex items-center justify-center text-xs transition cursor-pointer select-none"
                            title="Decrease temperature"
                          >
                            -
                          </button>
                          
                          {/* Temperature visual bar */}
                          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden relative flex items-center">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                              style={{ width: `${Math.max(0, Math.min(100, (((selectedRoom.ac_temp || 24) - 16) / 14) * 100))}%` }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => adjustAcTemp(selectedRoom.id, (selectedRoom.ac_temp || 24) + 1)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg flex items-center justify-center text-xs transition cursor-pointer select-none"
                            title="Increase temperature"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>MIN: 16°C</span>
                          <span>ECO TARGET</span>
                          <span>MAX: 30°C</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* STATUS CHANGE SECTION OVERRIDE */}
              <div className="space-y-2.5 border-t border-slate-800/85 pt-4">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                  ⚙️ {currentT.actions}
                </span>

                {/* Overwrite state selector form */}
                {isEditingStatus ? (
                  <form onSubmit={handleStatusOverrideSubmit} className="space-y-3.5 bg-[#0a0f1d] p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider">
                      {currentT.changeStatus}
                    </span>
                    <div className="space-y-2">
                      {(['Available', 'Occupied', 'Reserved', 'Maintenance'] as const).map((stat) => (
                        <label 
                          key={stat} 
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer hover:bg-slate-900 transition ${
                            newRoomStatus === stat 
                              ? 'border-indigo-500 bg-indigo-950/25 text-white font-bold' 
                              : 'border-slate-850 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              stat === 'Available' ? 'bg-emerald-400' :
                              stat === 'Occupied' ? 'bg-rose-400' :
                              stat === 'Reserved' ? 'bg-amber-400' : 'bg-slate-400'
                            }`} />
                            <span>{stat}</span>
                          </div>
                          <input
                            type="radio"
                            name="roomStatusOverride"
                            value={stat}
                            checked={newRoomStatus === stat}
                            onChange={() => setNewRoomStatus(stat)}
                            className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 h-3 w-3"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-2 text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingStatus(false)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
                      >
                        {lang === 'en' ? 'Apply Change' : 'យល់ព្រម'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Override Button */}
                    <button
                      type="button"
                      onClick={() => setIsEditingStatus(true)}
                      className="py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 hover:bg-slate-850 cursor-pointer text-center leading-none"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>{lang === 'en' ? 'Edit Status' : 'កែស្ថានភាព'}</span>
                    </button>

                    {/* Book Room workflow */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerToast(`Loading Room #${selectedRoom.room_no} into Reservations Manager...`);
                        setActiveTab('reservations');
                      }}
                      className="py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center leading-none"
                    >
                      <PlusCircle className="w-4 h-4 text-indigo-400" />
                      <span>{currentT.bookRoom}</span>
                    </button>

                    {/* Jump tab button */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerToast(`Jumping to reservations for Room ${selectedRoom.room_no}...`);
                        setActiveTab('reservations');
                      }}
                      className="col-span-2 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl transition border border-slate-800 flex items-center justify-center gap-2 cursor-pointer text-center leading-none"
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>{currentT.jumpToRes}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="my-auto text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-650 mx-auto shadow-inner">
                <Info className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                  {lang === 'en' ? 'Select Room' : 'សូមជ្រើសរើសបន្ទប់'}
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {lang === 'en' 
                    ? 'Click on any room cell on the architectural map to pull up real-time hospitality details.' 
                    : 'សូមចុចលើបន្ទប់ណាមួយ ដើម្បីគ្រប់គ្រងព័ត៌មានលម្អិត និងកក់បន្ទប់ភ្លាមៗ។'}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
