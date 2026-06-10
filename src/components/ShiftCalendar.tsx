import React, { useState } from 'react';
import { Staff } from '../types';
import { 
  Calendar, Clock, Plus, Trash2, ChevronLeft, ChevronRight, 
  Filter, AlertCircle, Briefcase, Info 
} from 'lucide-react';

interface ShiftAssignment {
  id: string;
  staffId: number;
  staffName: string;
  position: string;
  date: string; // YYYY-MM-DD
  shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Day' | 'Off';
  timeRange: string;
  notes?: string;
}

interface ShiftCalendarProps {
  staff: Staff[];
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

// Pre-seeded shifts for June 2026
const generateInitialShifts = (staffList: Staff[]): ShiftAssignment[] => {
  const shifts: ShiftAssignment[] = [];
  let idCounter = 1;
  const year = 2026;
  const month = 5; // June (0-indexed)
  
  for (let day = 1; day <= 30; day++) {
    const dateStr = `2026-06-${day < 10 ? '0' + day : day}`;
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const manager = staffList.find(s => s.position === 'Manager');
    const receptionist = staffList.find(s => s.position === 'Receptionist');
    const accountant = staffList.find(s => s.position === 'Accountant');
    const security = staffList.find(s => s.position === 'Security & Maintenance');
    const housekeeping = staffList.filter(s => s.position.toLowerCase().includes('housekeeping'));

    if (manager) {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: manager.id,
          staffName: manager.name,
          position: manager.position,
          date: dateStr,
          shiftType: 'Day',
          timeRange: '09:00 - 18:00',
          notes: 'Executive Management'
        });
      } else {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: manager.id,
          staffName: manager.name,
          position: manager.position,
          date: dateStr,
          shiftType: 'Off',
          timeRange: 'N/A',
          notes: 'Weekend Rest'
        });
      }
    }

    if (receptionist) {
      if (dayOfWeek === 0) {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: receptionist.id,
          staffName: receptionist.name,
          position: receptionist.position,
          date: dateStr,
          shiftType: 'Off',
          timeRange: 'N/A',
          notes: 'Scheduled Day Off'
        });
      } else if (day % 2 !== 0) {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: receptionist.id,
          staffName: receptionist.name,
          position: receptionist.position,
          date: dateStr,
          shiftType: 'Morning',
          timeRange: '06:00 - 14:00',
          notes: 'Front Desk Coverage'
        });
      } else {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: receptionist.id,
          staffName: receptionist.name,
          position: receptionist.position,
          date: dateStr,
          shiftType: 'Afternoon',
          timeRange: '14:00 - 22:00',
          notes: 'Key handover & check out'
        });
      }
    }

    if (accountant) {
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: accountant.id,
          staffName: accountant.name,
          position: accountant.position,
          date: dateStr,
          shiftType: 'Day',
          timeRange: '09:00 - 17:00',
          notes: 'Bookkeeping & Taxes'
        });
      } else {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: accountant.id,
          staffName: accountant.name,
          position: accountant.position,
          date: dateStr,
          shiftType: 'Off',
          timeRange: 'N/A',
          notes: 'Off Duty'
        });
      }
    }

    if (security) {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: security.id,
          staffName: security.name,
          position: security.position,
          date: dateStr,
          shiftType: 'Night',
          timeRange: '22:00 - 06:00',
          notes: 'Night Guard Check'
        });
      } else {
        shifts.push({
          id: `shift-${idCounter++}`,
          staffId: security.id,
          staffName: security.name,
          position: security.position,
          date: dateStr,
          shiftType: 'Off',
          timeRange: 'N/A',
          notes: 'Sec Rest'
        });
      }
    }
  }
  return shifts;
};

export default function ShiftCalendar({ staff, lang, t, triggerToast }: ShiftCalendarProps) {
  const [shifts, setShifts] = useState<ShiftAssignment[]>(() => generateInitialShifts(staff));

  // Calendar States
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5); // June (5 is 0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-09');

  // Filters
  const [filterStaffId, setFilterStaffId] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formStaffId, setFormStaffId] = useState<number | ''>('');
  const [formDate, setFormDate] = useState('2026-06-09');
  const [formType, setFormType] = useState<'Morning' | 'Afternoon' | 'Night' | 'Day' | 'Off'>('Morning');
  const [formHours, setFormHours] = useState('06:00 - 14:00');
  const [formNotes, setFormNotes] = useState('');

  // Math Helper
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayIndex = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
  };

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = m + 1 < 10 ? `0${m + 1}` : `${m + 1}`;
    const dd = d < 10 ? `0${d}` : `${d}`;
    return `${y}-${mm}-${dd}`;
  };

  const getMonthLabel = (m: number) => {
    const khMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return lang === 'kh' ? khMonths[m] : enMonths[m];
  };

  const formatFriendlyDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (lang === 'kh') {
      const khDayArr = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
      const khMonthArr = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      return `${khDayArr[dateObj.getDay()]} ទី${d} ${khMonthArr[dateObj.getMonth()]} ${y}`;
    }
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getShiftColors = (type: string) => {
    switch (type) {
      case 'Morning':
        return {
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20',
          label: lang === 'en' ? 'Morning Shift' : 'វេនព្រឹក'
        };
      case 'Afternoon':
        return {
          dot: 'bg-indigo-500',
          badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
          label: lang === 'en' ? 'Afternoon Shift' : 'វេនរសៀល'
        };
      case 'Night':
        return {
          dot: 'bg-rose-500',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          label: lang === 'en' ? 'Night Shift' : 'វេនយប់'
        };
      case 'Day':
        return {
          dot: 'bg-amber-500',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          label: lang === 'en' ? 'General Day' : 'ពេញមួយថ្ងៃ'
        };
      case 'Off':
      default:
        return {
          dot: 'bg-slate-500',
          badge: 'bg-slate-800/80 text-slate-400 border border-slate-700/80',
          label: lang === 'en' ? 'Off Duty' : 'ថ្ងៃសម្រាក'
        };
    }
  };

  const getFilteredShiftsForDay = (dateStr: string) => {
    return shifts.filter(sh => {
      // Filter out deleted staff
      const isStaffValid = staff.some(s => s.id === sh.staffId);
      if (!isStaffValid) return false;

      const matchesStaff = filterStaffId === 'All' || sh.staffId === Number(filterStaffId);
      const matchesType = filterType === 'All' || sh.shiftType === filterType;
      return sh.date === dateStr && matchesStaff && matchesType;
    });
  };

  // Nav actions
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setYear(2026);
    setMonth(5);
    setSelectedDateStr('2026-06-09');
  };

  const handleTypeChangeInForm = (type: 'Morning' | 'Afternoon' | 'Night' | 'Day' | 'Off') => {
    setFormType(type);
    if (type === 'Morning') setFormHours('06:00 - 14:00');
    else if (type === 'Afternoon') setFormHours('14:00 - 22:00');
    else if (type === 'Night') setFormHours('22:00 - 06:00');
    else if (type === 'Day') setFormHours('09:00 - 18:00');
    else if (type === 'Off') setFormHours('N/A');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffId) {
      triggerToast(lang === 'en' ? 'Please select an employee!' : 'សូមជ្រើសរើសបុគ្គលិក!');
      return;
    }
    const emp = staff.find(s => s.id === formStaffId);
    if (!emp) return;

    // Check conflict
    const exists = shifts.some(s => s.staffId === emp.id && s.date === formDate);
    if (exists) {
      triggerToast(lang === 'en' 
        ? `${emp.name} already has a shift assigned on ${formDate}!` 
        : `${emp.name} មានវេនការងាររួចហើយនៅថ្ងៃទី ${formDate}!`);
      return;
    }

    const newShift: ShiftAssignment = {
      id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      staffId: emp.id,
      staffName: emp.name,
      position: emp.position,
      date: formDate,
      shiftType: formType,
      timeRange: formHours,
      notes: formNotes.trim() || undefined
    };

    setShifts(prev => [...prev, newShift]);
    setShowModal(false);
    triggerToast(lang === 'en' 
      ? `Shift registered for ${emp.name} on ${formDate}` 
      : `បានចុះឈ្មោះវេនការងារជូន ${emp.name} នៅថ្ងៃទី ${formDate}`);
    setFormNotes('');
  };

  const handleDeleteShift = (id: string, name: string, date: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    triggerToast(lang === 'en' 
      ? `Removed shift for ${name} on ${date}` 
      : `បានលុបវេនការងាររបស់ ${name} នៅថ្ងៃទី ${date}`);
  };

  // Render Grid engine
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayIndex(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const calendarDays = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) {
      calendarDays.push({ dayNum, dateStr: formatDateStr(year, month, dayNum), isPadding: false });
    } else {
      calendarDays.push({ dayNum: null, dateStr: null, isPadding: true });
    }
  }

  const enWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const khWeekdays = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];
  const weekDaysHeader = lang === 'kh' ? khWeekdays : enWeekdays;

  const currentDayShifts = getFilteredShiftsForDay(selectedDateStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Calendar layout card */}
      <div className="lg:col-span-8 bg-slate-800/20 border border-slate-700/60 rounded-2xl p-5 space-y-5 shadow-lg">
        
        {/* Navigation control header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button 
              onClick={prevMonth}
              className="p-1.5 bg-slate-900 border border-slate-755 rounded-lg text-slate-300 hover:text-white transition"
              title="Prev Month"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <h3 className="text-sm font-black text-white min-w-[120px] text-center tracking-wider font-mono uppercase bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
              {getMonthLabel(month)} {year}
            </h3>
            <button 
              onClick={nextMonth}
              className="p-1.5 bg-slate-900 border border-slate-755 rounded-lg text-slate-300 hover:text-white transition"
              title="Next Month"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-2.5 py-1.5 text-[10px] uppercase font-mono font-black border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
            >
              {lang === 'en' ? 'Today' : 'ថ្ងៃនេះ'}
            </button>
          </div>

          {/* Quick filter lists */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-755 rounded-lg px-2.5 py-1 text-[11px]">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={filterStaffId}
                onChange={(e) => setFilterStaffId(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-300 cursor-pointer text-[10px] font-mono"
              >
                <option value="All">{lang === 'en' ? 'All Staff' : 'បុគ្គលិកទាំងអស់'}</option>
                {staff.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-755 rounded-lg px-2.5 py-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-300 cursor-pointer text-[10px] font-mono"
              >
                <option value="All">{lang === 'en' ? 'All Shifts' : 'គ្រប់វេនទាំងអស់'}</option>
                <option value="Morning">{lang === 'en' ? 'Morning Shift' : 'វេនព្រឹក'}</option>
                <option value="Afternoon">{lang === 'en' ? 'Afternoon Shift' : 'វេនរសៀល'}</option>
                <option value="Night">{lang === 'en' ? 'Night Shift' : 'វេនយប់'}</option>
                <option value="Day">{lang === 'en' ? 'General Day' : 'ពេញមួយថ្ងៃ'}</option>
                <option value="Off">{lang === 'en' ? 'Off / Rest' : 'ថ្ងៃសម្រាក'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar column header names */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
          {weekDaysHeader.map(header => (
            <div key={header} className="py-1.5 bg-slate-900/40 rounded-lg border border-slate-800/10 font-mono">
              {header}
            </div>
          ))}
        </div>

        {/* Days grid layout */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, idx) => {
            if (cell.isPadding) {
              return (
                <div 
                  key={`pad-${idx}`} 
                  className="h-16 bg-slate-900/10 border border-slate-800/20 rounded-xl opacity-15"
                />
              );
            }

            const dateStr = cell.dateStr!;
            const dayNum = cell.dayNum!;
            const dayShifts = getFilteredShiftsForDay(dateStr);
            const isSelected = selectedDateStr === dateStr;
            const isToday = dateStr === '2026-06-09';

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-18 p-1.5 rounded-xl border flex flex-col justify-between text-left transition duration-150 scale-100 hover:scale-[1.02] active:scale-95 outline-none ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20' 
                    : isToday 
                      ? 'border-teal-500/50 bg-teal-500/5'
                      : 'border-slate-800 bg-slate-900/10 hover:bg-slate-800/20'
                }`}
              >
                <div className="w-full flex justify-between items-center">
                  <span className={`text-[10px] font-mono leading-none font-bold ${
                    isSelected ? 'text-indigo-400' : isToday ? 'text-teal-400 font-black' : 'text-slate-300'
                  }`}>
                    {dayNum}
                  </span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" title="Today" />}
                </div>

                {/* Bullets capsule listing */}
                <div className="w-full space-y-0.5 max-h-8 overflow-hidden pointer-events-none">
                  {dayShifts.slice(0, 2).map((sh) => {
                    const colors = getShiftColors(sh.shiftType);
                    return (
                      <div 
                        key={sh.id}
                        className="flex items-center space-x-0.5 px-1 py-0.5 rounded bg-slate-950/80 border border-slate-800/30 text-[7.5px] truncate leading-none"
                      >
                        <span className={`w-1 h-1 rounded-full ${colors.dot} shrink-0`} />
                        <span className="text-slate-200 font-bold truncate leading-none">
                          {sh.staffName.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                  {dayShifts.length > 2 && (
                    <span className="text-[7px] text-indigo-400 font-black tracking-tighter leading-none block text-right pr-0.5">
                      +{dayShifts.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend block bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] text-slate-400 font-mono pt-3 border-t border-slate-800/40">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Morning (06 - 14)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Afternoon (14 - 22)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Night (22 - 06)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>General Day (09 - 18)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Off Duty</span>
          </div>
        </div>
      </div>

      {/* Right Column details panel on selected date */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[#0f172a] border border-indigo-500/20 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-widest font-mono">Operations HUD</span>
            <h3 className="font-extrabold text-white text-sm mt-0.5">
              {lang === 'en' ? 'Shift Schedule Details' : 'ព័ត៌មានលម្អិតវេន'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 pb-2 border-b border-slate-800/80 font-mono">
              {formatFriendlyDate(selectedDateStr)}
            </p>
          </div>

          {/* Core summary stats */}
          <div className="bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
            <div>
              <span className="text-slate-500 text-[8px] uppercase font-bold">{lang === 'en' ? 'ACTIVE' : 'កំពុងធ្វើការ'}</span>
              <p className="text-white font-extrabold text-xs">{currentDayShifts.filter(sh => sh.shiftType !== 'Off').length}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[8px] uppercase font-bold">{lang === 'en' ? 'RESTING' : 'សម្រាក'}</span>
              <p className="text-slate-400 font-extrabold text-xs">{currentDayShifts.filter(sh => sh.shiftType === 'Off').length}</p>
            </div>
          </div>

          {/* Roster shifts list block */}
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {currentDayShifts.map((sh) => {
              const colors = getShiftColors(sh.shiftType);
              return (
                <div 
                  key={sh.id}
                  className="bg-slate-900 border border-slate-800/60 p-3 rounded-lg relative group space-y-2"
                >
                  <button
                    onClick={() => handleDeleteShift(sh.id, sh.staffName, sh.date)}
                    className="absolute top-2 right-2 p-1 bg-slate-950/40 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
                    title="Remove Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 border border-indigo-500 text-white font-bold flex items-center justify-center text-[10px] uppercase font-mono shadow-sm">
                      {sh.staffName.substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-100 text-xs truncate">{sh.staffName}</h4>
                      <p className="text-[9px] text-slate-450 font-mono flex items-center gap-1">
                        <Briefcase className="w-3 h-3 shrink-0 text-slate-500" />
                        <span className="truncate">{sh.position}</span>
                      </p>
                    </div>
                  </div>

                  {/* Badges information */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-800/40">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${colors.badge}`}>
                      {colors.label}
                    </span>
                    {sh.shiftType !== 'Off' && (
                      <span className="text-[8.5px] text-slate-300 font-mono flex items-center gap-1 bg-slate-950/50 border border-slate-850 px-1.5 py-0.5 rounded leading-none">
                        <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                        {sh.timeRange}
                      </span>
                    )}
                  </div>

                  {sh.notes && (
                    <p className="text-[9px] text-slate-400 italic bg-slate-950/30 p-1.5 rounded-md border border-slate-850 pl-2 border-l-indigo-500 border-l mb-1 leading-snug">
                      "{sh.notes}"
                    </p>
                  )}
                </div>
              );
            })}

            {currentDayShifts.length === 0 && (
              <div className="py-10 border border-dashed border-slate-850 rounded-xl text-center flex flex-col items-center justify-center space-y-2 bg-slate-900/10">
                <AlertCircle className="w-6 h-6 text-slate-700 animate-pulse" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">
                    {lang === 'en' ? 'No Assigned Shift' : 'គ្មានវេនការងារ'}
                  </p>
                  <p className="text-[9px] text-slate-550 leading-none">
                    {lang === 'en' ? 'Click "Assign Shift" to schedule.' : 'ចុច "កំណត់វេនការងារ" ដើម្បីបន្ថែម។'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal trigger action */}
          <button
            type="button"
            onClick={() => {
              setFormDate(selectedDateStr);
              if (staff.length > 0) {
                setFormStaffId(staff[0].id);
              }
              setShowModal(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-[#4f46e5] border border-indigo-550 text-white font-mono uppercase tracking-wider font-extrabold text-[10px] py-2.5 rounded-xl transition duration-150 select-none shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Assign Shift' : 'កំណត់វេនការងារ'}</span>
          </button>
        </div>

        {/* Help block informational box */}
        <div className="bg-slate-800/10 border border-slate-700/40 rounded-xl p-3 flex gap-2.5 text-[10px] text-slate-455 leading-normal">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-extrabold text-slate-300 block mb-0.5">Dual-View Directory Integration</span>
            All newly registered staff members in the human resources dashboard will immediately populate the shift assign profiles selector.
          </div>
        </div>
      </div>

      {/* Roster Assignment pop-up block modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-[#0f172a] border border-indigo-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 font-mono">
              {lang === 'en' ? 'Schedule Employee Shift' : 'កំណត់វេនការងារបុគ្គលិក'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {lang === 'en' ? 'Target Calendar Date *' : 'កាលបរិច្ឆេទ *'}
                </label>
                <input 
                  type="date" 
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {lang === 'en' ? 'Select Employee *' : 'ជ្រើសរើសបុគ្គលិក *'}
                </label>
                <select
                  value={formStaffId}
                  onChange={(e) => setFormStaffId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-white outline-none cursor-pointer text-[11px]"
                  required
                >
                  <option value="">{lang === 'en' ? 'Choose from active staff...' : 'ជ្រើសរើសបុគ្គលិក...'}</option>
                  {staff.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {lang === 'en' ? 'Shift Option Code' : 'លក្ខណៈវេនការងារ'}
                </label>
                <select
                  value={formType}
                  onChange={(e) => handleTypeChangeInForm(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-white outline-none cursor-pointer text-[11.5px]"
                >
                  <option value="Morning">Morning Shift (06:00 - 14:00)</option>
                  <option value="Afternoon">Afternoon Shift (14:00 - 22:00)</option>
                  <option value="Night">Night Shift (22:00 - 06:00)</option>
                  <option value="Day">General Day Shift (09:00 - 18:00)</option>
                  <option value="Off">Off / Resting</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {lang === 'en' ? 'Roster Work Hours' : 'ម៉ោងធ្វើការ'}
                </label>
                <input 
                  type="text" 
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-white outline-none font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {lang === 'en' ? 'Operations Note' : 'កំណត់ចំណាំបន្ថែម'}
                </label>
                <input 
                  type="text" 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Backdoor guard coverage, lobby support"
                  className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-white outline-none text-[10.5px]"
                />
              </div>

              <div className="pt-3.5 border-t border-slate-800 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-650 hover:bg-[#4f46e5] rounded-lg text-white font-black uppercase tracking-wider"
                >
                  {lang === 'en' ? 'Register' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
