import React, { useState, useEffect } from 'react';
import { translations } from './translations';
import {
  initialRooms,
  initialGuests,
  initialReservations,
  initialUtilityBills,
  initialTransactions,
  initialStaff,
  initialCrmNotes
} from './mockData';
import {
  Room,
  Guest,
  Reservation,
  UtilityBill,
  Transaction,
  Staff,
  CrmNote,
  SystemNotification
} from './types';

// Component Imports
import Dashboard from './components/Dashboard';
import RoomManagement from './components/RoomManagement';
import GuestManagement from './components/GuestManagement';
import Reservations from './components/Reservations';
import CheckInOut from './components/CheckInOut';
import UtilityBilling from './components/UtilityBilling';
import IncomeExpense from './components/IncomeExpense';
import StaffPayroll from './components/StaffPayroll';
import CrmNotepad from './components/CrmNotepad';
import Reports from './components/Reports';
import DevHub from './components/DevHub';
import GuestPortal from './components/GuestPortal';
import FloorMap from './components/FloorMap';

import {
  LayoutDashboard,
  Map,
  Home,
  Users,
  CalendarDays,
  ShieldCheck,
  Zap,
  DollarSign,
  Briefcase,
  MessagesSquare,
  FileSpreadsheet,
  Cpu,
  Bell,
  Sun,
  Moon,
  Building,
  Shield,
  Search,
  CheckCircle,
  HelpCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'kh' | 'vi' | 'ch' | 'jp'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [branch, setBranch] = useState<string>('Phnom Penh Headquarters');
  const [role, setRole] = useState<string>('Super Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Reactive States
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [utilities, setUtilities] = useState<UtilityBill[]>(initialUtilityBills);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [crmNotes, setCrmNotes] = useState<CrmNote[]>(initialCrmNotes);
  const [exchangeRate, setExchangeRate] = useState<number>(4100);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [notifiedCheckins, setNotifiedCheckins] = useState<number[]>([]);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    { id: 1, text: "Room 102 requires utility meter reading by end of today.", type: "Warning", time: "10 mins ago" },
    { id: 2, text: "Reservation for Sok Mean is ready to expire in 5 days.", type: "Important", time: "1 hr ago" },
    { id: 3, text: "Advanced deposit payment logged for customer Nisay Roth.", type: "Success", time: "3 hrs ago" },
    { id: 4, text: "Database connection successfully routed over Laravel 12 API.", type: "Info", time: "4 hrs ago" }
  ]);

  // Translate Helper
  const t = (key: string) => {
    return (translations[lang] as any)[key] || key;
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  // Run automatically on load or change. Detect if checkin is today and alert the receptionist clerk.
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const startingToday = reservations.filter(
      r => r.checkin === todayStr && 
      r.status !== 'Cancelled' && 
      !notifiedCheckins.includes(r.id)
    );

    if (startingToday.length > 0) {
      startingToday.forEach((res, index) => {
        // Trigger a premium reminder toast slightly staggered
        setTimeout(() => {
          triggerToast(lang === 'en'
            ? `🔔 Reminder: ${res.guest_name}'s reservation for Room ${res.room_no} starts today!`
            : `🔔 រំលឹក៖ ការកក់របស់ភ្ញៀវ ${res.guest_name} សម្រាប់បន្ទប់ ${res.room_no} ចាប់ផ្តើមនៅថ្ងៃនេះ!`);
        }, index * 800);

        // Append to local system notifications
        setNotifications(prev => {
          const textMsg = `Reminder: ${res.guest_name}'s reservation for Room ${res.room_no} starts today.`;
          if (prev.some(n => n.text === textMsg)) return prev;
          return [
            {
              id: prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1,
              text: textMsg,
              type: 'Important',
              time: 'Just now'
            },
            ...prev
          ];
        });
      });

      // Avoid looping alerts on state triggers
      setNotifiedCheckins(prev => [...prev, ...startingToday.map(r => r.id)]);
    }
  }, [reservations, notifiedCheckins, lang]);

  // Clear a notification
  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    triggerToast("Notification dismissed.");
  };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'floorMap', label: t('floorMap'), icon: Map },
    { id: 'guestPortal', label: t('guestPortal'), icon: Sparkles },
    { id: 'rooms', label: t('roomManagement'), icon: Home },
    { id: 'guests', label: t('guestManagement'), icon: Users },
    { id: 'reservations', label: t('reservations'), icon: CalendarDays },
    { id: 'checkin', label: t('checkInOut'), icon: ShieldCheck },
    { id: 'utilities', label: t('utilityBilling'), icon: Zap },
    { id: 'finance', label: t('incomeExpense'), icon: DollarSign },
    { id: 'payroll', label: t('staffPayroll'), icon: Briefcase },
    { id: 'crm', label: t('crm'), icon: MessagesSquare },
    { id: 'reports', label: t('reports'), icon: FileSpreadsheet },
    { id: 'devhub', label: t('devHub'), icon: Cpu }
  ];

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      
      {/* Dynamic Toast HUD */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl transition duration-150 transform translate-y-0 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold text-xs tracking-wide">{toastMsg}</span>
        </div>
      )}

      {/* Main Top Header Navigation Panel */}
      <header className={`sticky top-0 z-40 border-b flex items-center justify-between px-6 py-3.5 shadow-sm no-print ${
        theme === 'dark' ? 'bg-[#1e293b]/90 border-slate-750 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'
      }`}>
        <div className="flex items-center space-x-3.5">
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-700/10 text-slate-400 hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="bg-indigo-650 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
            <Building className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white leading-none">{t('title')}</h1>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">
              Cambodian Workspace Sync Active
            </p>
          </div>
        </div>

        {/* Configurations Switchees */}
        <div className="hidden md:flex items-center space-x-4">
          
          {/* Branch Switching Selection */}
          <div className="flex items-center space-x-1.5 bg-slate-800/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={branch}
              onChange={(e) => { setBranch(e.target.value); triggerToast(`Switched active branch logs to ${e.target.value}`); }}
              className="bg-transparent text-[11px] text-indigo-300 font-bold outline-none cursor-pointer"
            >
              <option value="Phnom Penh Headquarters" className="text-slate-850">Phnom Penh (HQ)</option>
              <option value="Siem Reap Angkor Branch" className="text-slate-850">Siem Reap Angkor</option>
              <option value="Sihanoukville Coastal Branch" className="text-slate-850">Sihanoukville Coastal</option>
            </select>
          </div>

          {/* Role selection switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); triggerToast(`Switched account clearances to: ${e.target.value}`); }}
              className="bg-transparent text-[11px] text-indigo-300 font-bold outline-none cursor-pointer"
            >
              <option value="Super Admin" className="text-slate-850">Super Admin Mode</option>
              <option value="Branch Manager" className="text-slate-850">Branch Manager</option>
              <option value="Reception Desk" className="text-slate-850">Receptionist Clerk</option>
            </select>
          </div>

          {/* 5-Language Switcher */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 text-[10px] font-bold">
            <button
              onClick={() => { setLang('en'); triggerToast("Language set to English."); }}
              className={`px-2 py-1 rounded-lg transition duration-150 cursor-pointer ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => { setLang('kh'); triggerToast("ភាសាត្រូវបានផ្លាស់ប្តូរទៅជាភាសាខ្មែរ។"); }}
              className={`px-2 py-1 rounded-lg transition duration-150 cursor-pointer ${lang === 'kh' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="ភាសាខ្មែរ"
            >
              KH
            </button>
            <button
              onClick={() => { setLang('vi'); triggerToast("Đã chuyển sang Tiếng Việt."); }}
              className={`px-2 py-1 rounded-lg transition duration-150 cursor-pointer ${lang === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Tiếng Việt"
            >
              VI
            </button>
            <button
              onClick={() => { setLang('ch'); triggerToast("已切换到简体中文。"); }}
              className={`px-2 py-1 rounded-lg transition duration-150 cursor-pointer ${lang === 'ch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="中文"
            >
              CH
            </button>
            <button
              onClick={() => { setLang('jp'); triggerToast("日本語に切り替えました。"); }}
              className={`px-2 py-1 rounded-lg transition duration-150 cursor-pointer ${lang === 'jp' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="日本語"
            >
              JP
            </button>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:text-indigo-400 transition"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-455" />}
          </button>

          {/* Notification Alert Bell icon */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:text-indigo-400 transition relative"
            title="Notification Center"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main workspace frame container */}
      <div className="flex">
        
        {/* Navigation Sidebar Panel */}
        <aside className={`w-64 border-r shrink-0 hidden md:block min-h-[calc(100vh-62px)] no-print ${
          theme === 'dark' ? 'bg-[#111c30]/60 border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <nav className="p-4 space-y-1">
            {menuItems.map(item => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition ${
                    activeTab === item.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : theme === 'dark' 
                        ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className={`w-64 h-full p-4 space-y-1 shadow-2xl relative ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-700">
                <span className="font-bold text-sm text-indigo-400">Navigation Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {menuItems.map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition ${
                      activeTab === item.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : theme === 'dark' 
                          ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Render Canvas Stage */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto">
          
          {/* Active Tab Router Switchees */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              rooms={rooms} 
              transactions={transactions} 
              reservations={reservations}
              lang={lang} 
              t={t} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'floorMap' && (
            <FloorMap
              rooms={rooms}
              setRooms={setRooms}
              reservations={reservations}
              setReservations={setReservations}
              guests={guests}
              lang={lang}
              t={t}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              theme={theme}
            />
          )}

          {activeTab === 'guestPortal' && (
            <GuestPortal 
              rooms={rooms}
              setRooms={setRooms}
              guests={guests}
              setGuests={setGuests}
              reservations={reservations}
              setReservations={setReservations}
              lang={lang}
              t={t}
              triggerToast={triggerToast}
              exchangeRate={exchangeRate}
              crmNotes={crmNotes}
              setCrmNotes={setCrmNotes}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomManagement 
              rooms={rooms} 
              setRooms={setRooms} 
              notifications={notifications}
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'guests' && (
            <GuestManagement 
              guests={guests} 
              setGuests={setGuests} 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'reservations' && (
            <Reservations 
              reservations={reservations} 
              setReservations={setReservations} 
              rooms={rooms} 
              setRooms={setRooms}
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'checkin' && (
            <CheckInOut 
              rooms={rooms} 
              setRooms={setRooms} 
              transactions={transactions}
              setTransactions={setTransactions}
              guests={guests}
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
              reservations={reservations}
              setReservations={setReservations}
            />
          )}

          {activeTab === 'utilities' && (
            <UtilityBilling 
              utilities={utilities} 
              setUtilities={setUtilities} 
              rooms={rooms} 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
              exchangeRate={exchangeRate}
              setExchangeRate={setExchangeRate}
            />
          )}

          {activeTab === 'finance' && (
            <IncomeExpense 
              transactions={transactions} 
              setTransactions={setTransactions} 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
              exchangeRate={exchangeRate}
              setExchangeRate={setExchangeRate}
            />
          )}

          {activeTab === 'payroll' && (
            <StaffPayroll 
              staff={staff} 
              setStaff={setStaff} 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'crm' && (
            <CrmNotepad 
              crmNotes={crmNotes} 
              setCrmNotes={setCrmNotes} 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'reports' && (
            <Reports 
              rooms={rooms} 
              transactions={transactions} 
              staff={staff} 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === 'devhub' && (
            <DevHub 
              lang={lang} 
              t={t} 
              triggerToast={triggerToast} 
            />
          )}

        </main>

        {/* Notifications Tray Sidebar Slideout */}
        {showNotifications && (
          <aside className="w-80 border-l p-5 shrink-0 hidden lg:block bg-[#111c30]/90 border-slate-750 min-h-[calc(100vh-62px)] relative no-print">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span>{t('notifications')}</span>
              </span>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {notifications.map(notif => (
                <div key={notif.id} className="p-3.5 bg-slate-900 border border-slate-750 rounded-xl space-y-1 relative">
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      notif.type === 'Warning' ? 'bg-amber-500/10 text-amber-500' :
                      notif.type === 'Success' ? 'bg-emerald-500/10 text-emerald-400' :
                      notif.type === 'Important' ? 'bg-rose-500/10 text-rose-450' : 'bg-indigo-500/15 text-indigo-400'
                    }`}>
                      {notif.type}
                    </span>
                    <button 
                      onClick={() => dismissNotification(notif.id)}
                      className="text-slate-500 hover:text-slate-300 text-xs shrink-0"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-normal pt-1">{notif.text}</p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">{notif.time}</span>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <span>No new active notifications.</span>
                </div>
              )}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}
