import React, { useState, useMemo } from 'react';
import { Room, Guest, Reservation, CrmNote } from '../types';
import { 
  Calendar, 
  Search, 
  CheckCircle, 
  X, 
  Sparkles, 
  DollarSign, 
  Smartphone, 
  ChevronRight, 
  Info, 
  Users, 
  QrCode, 
  ShieldCheck, 
  Star,
  Coffee,
  Wifi,
  Wind,
  Tv,
  Lock,
  User,
  LogOut,
  Mail,
  Facebook,
  Key,
  CreditCard,
  Check
} from 'lucide-react';

interface GuestPortalProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
  exchangeRate: number;
  crmNotes: CrmNote[];
  setCrmNotes: React.Dispatch<React.SetStateAction<CrmNote[]>>;
}

// Curated stunning high-res photos for different types of suites
const ROOM_IMAGES: Record<string, string> = {
  'Single Deluxe': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
  'Double VIP': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
  'Family Suite': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
  'Penthouse President': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=805',
};

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800';

export default function GuestPortal({
  rooms,
  setRooms,
  guests,
  setGuests,
  reservations,
  setReservations,
  lang,
  t,
  triggerToast,
  exchangeRate,
  crmNotes,
  setCrmNotes
}: GuestPortalProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authedUser, setAuthedUser] = useState<{
    name: string;
    phone: string;
    email: string;
    authMethod: 'facebook' | 'telegram' | 'password';
    tier?: string;
    discount?: number;
    is_authorized?: boolean;
  } | null>(null);

  // Authentication Flow Controls
  const [authMethod, setAuthMethod] = useState<'facebook' | 'telegram' | 'password'>('password');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [passwordPass, setPasswordPass] = useState('');
  const [passwordFullName, setPasswordFullName] = useState('');
  const [passwordPhone, setPasswordPhone] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Telegram Mock Auth States
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramPassword, setTelegramPassword] = useState('');
  const [telegramPopupStep, setTelegramPopupStep] = useState(false);

  // Facebook Mock Auth States
  const [fbEmail, setFbEmail] = useState('');
  const [fbPassword, setFbPassword] = useState('');
  const [fbConnecting, setFbConnecting] = useState(false);

  // Navigation inside Portal (only accessible after logging in)
  const [viewState, setViewState] = useState<'browse' | 'form' | 'payment' | 'success'>('browse');
  const [portalTab, setPortalTab] = useState<'booking' | 'feedback'>('booking');

  // Feedback Form states
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'Note' | 'Complaint' | 'Request'>('Note');
  const [feedbackTargetRes, setFeedbackTargetRes] = useState<string>('general');
  
  // Room filtering States
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(200);

  // Selected Room for Booking
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Payment Options (Upfront Payment Requirement)
  const [paymentPolicy, setPaymentPolicy] = useState<'full' | 'deposit'>('full');

  // Form States (partially pre-filled from authed user)
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idPassport, setIdPassport] = useState('');
  const [emergency, setEmergency] = useState('');
  
  // Custom booking dates (defaults to today + 3 days)
  const [checkin, setCheckin] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [checkout, setCheckout] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // Booking details calculation
  const totalNights = useMemo(() => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 1;
  }, [checkin, checkout]);

  const grandTotal = useMemo(() => {
    if (!selectedRoom) return 0;
    const baseTotal = selectedRoom.daily_price * totalNights;
    if (authedUser && authedUser.discount) {
      const discountVal = baseTotal * (authedUser.discount / 100);
      return Math.round(baseTotal - discountVal);
    }
    return baseTotal;
  }, [selectedRoom, totalNights, authedUser]);

  const requiredAmount = useMemo(() => {
    if (paymentPolicy === 'full') {
      return grandTotal; // Full Prepayment
    }
    return Math.round(grandTotal * 0.3); // 30% Commitment Deposit
  }, [grandTotal, paymentPolicy]);

  const paymentInRiel = useMemo(() => {
    return requiredAmount * exchangeRate;
  }, [requiredAmount, exchangeRate]);

  // Simulated Success ID trackers
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  // Unique Room Types list
  const roomTypes = useMemo(() => {
    return ['All', ...Array.from(new Set(rooms.map(r => r.type)))];
  }, [rooms]);

  // Filtered Room Catalog (only showing available)
  const availableRoomsCatalog = useMemo(() => {
    return rooms.filter(room => {
      const typeMatch = selectedType === 'All' || room.type === selectedType;
      const floorMatch = selectedFloor === 'All' || room.floor === selectedFloor;
      const priceMatch = room.daily_price <= priceRange;
      const displayStatus = room.status === 'Available';
      return typeMatch && floorMatch && priceMatch && displayStatus;
    });
  }, [rooms, selectedType, selectedFloor, priceRange]);

  // Handle Select Room
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    
    // Auto-prefill form with user info if logged in
    if (authedUser) {
      setGuestName(authedUser.name);
      setPhone(authedUser.phone);
      setEmail(authedUser.email);
    }
    
    setViewState('form');
  };

  // Mock Register/Login with classical credentials
  const handleClassicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRegisterForm) {
      if (!passwordFullName.trim() || !passwordEmail.trim() || !passwordPass.trim() || !passwordPhone.trim()) {
        triggerToast(lang === 'en' ? "Please complete all registration inputs." : "សូមបំពេញព័ត៌មានចុះឈ្មោះឱ្យបានសព្វគ្រប់។");
        return;
      }
      const guestExists = guests.find(g => g.email.toLowerCase() === passwordEmail.trim().toLowerCase() || g.phone === passwordPhone.trim());
      let savedGuest = guestExists;
      if (!guestExists) {
        savedGuest = {
          id: guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1,
          name: passwordFullName.trim(),
          phone: passwordPhone.trim(),
          id_passport: 'N/A',
          email: passwordEmail.trim(),
          emergency: '',
          history: 'Self-registered through customer booking website.',
          tier: 'Standard',
          discount: 0,
          is_authorized: false
        };
        setGuests(prev => [...prev, savedGuest!]);
      }

      const user = {
        name: passwordFullName.trim(),
        phone: passwordPhone.trim(),
        email: passwordEmail.trim(),
        authMethod: 'password' as const,
        tier: savedGuest?.tier || 'Standard',
        discount: savedGuest?.discount || 0,
        is_authorized: savedGuest?.tier !== 'Standard'
      };
      setAuthedUser(user);
      setIsLoggedIn(true);
      triggerToast(lang === 'en' ? `Welcome ${user.name}! Account registered successfully.` : `សូមស្វាគមន៍ ${user.name}! បានបង្កើតគណនីនិងចូលដោយជោគជ័យ។`);
    } else {
      if (!passwordEmail.trim() || !passwordPass.trim()) {
        triggerToast(lang === 'en' ? "Please enter your Email and Password." : "សូមវាយបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់របស់អ្នក។");
        return;
      }
      // Demo auto-login with existing guests or placeholder
      const matchingGuest = guests.find(g => g.email.toLowerCase() === passwordEmail.trim().toLowerCase());
      const guestName = matchingGuest ? matchingGuest.name : "Sok Mean";
      const guestPhone = matchingGuest ? matchingGuest.phone : "+855 12 345 678";
      
      const user = {
        name: guestName,
        phone: guestPhone,
        email: passwordEmail.trim(),
        authMethod: 'password' as const,
        tier: matchingGuest?.tier || 'Standard',
        discount: matchingGuest?.discount || 0,
        is_authorized: matchingGuest?.tier !== 'Standard'
      };
      setAuthedUser(user);
      setIsLoggedIn(true);
      triggerToast(lang === 'en' ? `Welcome back, ${user.name}!` : `សូមស្វាគមន៍ត្រឡប់មកវិញ ភ្ញៀវ ${user.name}!`);
    }
  };

  // Mock Facebook Sign-In
  const handleFacebookLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbEmail.trim() || !fbPassword.trim()) {
      triggerToast(lang === 'en' ? "Please enter Facebook credentials." : "សូមបំពេញគណនីហ្វេសប៊ុករបស់អ្នក។");
      return;
    }
    setFbConnecting(true);
    setTimeout(() => {
      const matchingGuest = guests.find(g => g.email.toLowerCase() === fbEmail.trim().toLowerCase());
      const guestName = matchingGuest ? matchingGuest.name : "Nisay Roth (Facebook)";
      const guestPhone = matchingGuest ? matchingGuest.phone : "+855 85 555 123";
      
      const user = {
        name: guestName,
        phone: guestPhone,
        email: fbEmail.trim(),
        authMethod: 'facebook' as const,
        tier: matchingGuest?.tier || 'Standard',
        discount: matchingGuest?.discount || 0,
        is_authorized: matchingGuest?.tier !== 'Standard'
      };
      setAuthedUser(user);
      setIsLoggedIn(true);
      setFbConnecting(false);
      triggerToast(lang === 'en' ? "Linked successfully with Facebook Secure OAuth!" : "បានភ្ជាប់ និងចូលដោយជោគជ័យតាមហ្វេសប៊ុក!");
    }, 1200);
  };

  // Mock Telegram Sign-In
  const handleTelegramLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramUsername.trim() || !telegramPassword.trim()) {
      triggerToast(lang === 'en' ? "Please configure Telegram user & password verification code." : "សូមបំពេញលេខ ឬគណនីតេឡេក្រាម និងលេខសំងាត់។");
      return;
    }
    setTelegramPopupStep(true);
    setTimeout(() => {
      const cleanUsername = telegramUsername.replace('@', '').toLowerCase();
      const matchingGuest = guests.find(g => 
        (g.email && g.email.toLowerCase().includes(cleanUsername)) ||
        g.name.toLowerCase().includes(cleanUsername)
      );
      const guestName = matchingGuest ? matchingGuest.name : `${telegramUsername.replace('@', '')} (Telegram User)`;
      const guestPhone = matchingGuest ? matchingGuest.phone : "+855 99 999 888";
      
      const user = {
        name: guestName,
        phone: guestPhone,
        email: `${cleanUsername}@telegram.kh`,
        authMethod: 'telegram' as const,
        tier: matchingGuest?.tier || 'Standard',
        discount: matchingGuest?.discount || 0,
        is_authorized: matchingGuest?.tier !== 'Standard'
      };
      setAuthedUser(user);
      setIsLoggedIn(true);
      setTelegramPopupStep(false);
      triggerToast(lang === 'en' ? "Verified Telegram Secure Token!" : "បានផ្ទៀងផ្ទាត់កូដសុវត្ថិភាពតេឡេក្រាមរួចរាល់!");
    }, 1400);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthedUser(null);
    setSelectedRoom(null);
    setViewState('browse');
    triggerToast(lang === 'en' ? "Logged out of client portal safely." : "បានចាកចេញពីគណនីភ្ញៀវដោយជោគជ័យ។");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim() || !checkin || !checkout) {
      triggerToast(lang === 'en' ? "Please fill in all required customer details." : "សូមបំពេញព័ត៌មានអតិថិជនដែលចាំបាច់។");
      return;
    }

    const start = new Date(checkin);
    const end = new Date(checkout);
    if (start >= end) {
      triggerToast(lang === 'en' ? "Check-out date must be after check-in date." : "កាលបរិច្ឆេទចាកចេញត្រូវតែនៅក្រោយកាលបរិច្ឆេទចូលស្នាក់នៅ។");
      return;
    }

    setViewState('payment');
  };

  const handleConfirmReservationWithPayment = () => {
    if (!selectedRoom) return;

    // 1. Register Guest inside system database if they don't exist
    const guestExists = guests.find(g => g.name.toLowerCase() === guestName.trim().toLowerCase());
    let targetGuestId = guestExists?.id;

    if (!guestExists) {
      const newGuestId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
      const newGuestReg: Guest = {
        id: newGuestId,
        name: guestName.trim(),
        phone: phone.trim(),
        id_passport: idPassport.trim() || 'Online Self-Reg',
        email: email.trim() || 'online@soryaguesthouse.kh',
        emergency: emergency.trim() || 'No active emergency contact',
        history: `Self-registered via ${authedUser?.authMethod ? authedUser.authMethod.toUpperCase() : 'PORTAL'} direct booking.`
      };
      setGuests(prev => [...prev, newGuestReg]);
      targetGuestId = newGuestId;
    }

    // 2. Register Reservation with status pending approval or confirmed immediately based on required deposit paid
    const newReservationId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    const newBooking: Reservation = {
      id: newReservationId,
      guest_name: guestName.trim(),
      room_no: selectedRoom.room_no,
      checkin,
      checkout,
      status: 'Confirmed', // Set directly to Confirmed because our instructions state "ចំពោះការកក់ សណ្ឋាគារ ឬបន្ទប់ គឺតម្រូវអោយអតិថិជនបង់ប្រាក់មុន" (prepayment is fully required and made, so it gets Confirmed status!)
      deposit: requiredAmount
    };

    setReservations(prev => [...prev, newBooking]);
    setCreatedReservation(newBooking);

    // 3. Mark room status as Reserved immediately so nobody else books it
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoom.id) {
        return { ...r, status: 'Reserved' };
      }
      return r;
    }));

    triggerToast(lang === 'en' 
      ? `🎉 Success! Upfront Payment Succeeded. Suite R-${selectedRoom.room_no} is CONFIRMED!`
      : `🎉 ជោគជ័យ! ការបង់ប្រាក់មុនត្រូវបានយល់ព្រម។ បន្ទប់លេខ R-${selectedRoom.room_no} ត្រូវបានធានាជោគជ័យ!`
    );

    setViewState('success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Dynamic Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-10 shadow-xl border border-indigo-505/20">
        <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-gradient-to-tr from-pink-500/10 to-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-30px] left-[10%] w-56 h-56 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#0f172a] font-extrabold px-3.5 py-1 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Direct Booking Engine (Upfront Payment)' : 'ប្រព័ន្ធស្វ័យកក់បន្ទប់ (តម្រូវឱ្យទូទាត់មុន)'}
            </span>
            <h2 className="text-2xl md:text-3.5xl font-extrabold text-white tracking-tight leading-tight">
              {lang === 'en' ? 'Sorya Direct Booking Engine' : 'ប្រព័ន្ធស្វ័យកក់បន្ទប់ផ្ទាល់ផ្ទះសំណាក់ សុរិយា'}
            </h2>
            <p className="text-slate-350 text-xs font-medium leading-relaxed dark:text-indigo-200/80">
              {lang === 'en' 
                ? 'Select different luxury suite categories, review pristine photos and live prices. Upfront payment is fully required in compliance with hotel rules. Login instantly with Facebook, Telegram or Password.'
                : 'សូមជ្រើសរើសប្រភេទបន្ទប់ផ្សេងៗ រូបភាពប្រណិតៗ និងតម្លៃជាក់ស្តែង។ ការបង់ប្រាក់មុនត្រូវបានតម្រូវជាដាច់ខាត ដើម្បីធានាការកក់។ ចូលគណនីតាមរយៈ ហ្វេសប៊ុក តេឡេក្រាម ឬលេខសម្ងាត់។'}
            </p>
          </div>
          
          {isLoggedIn && (
            <div className="flex flex-col items-end gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  {lang === 'en' ? 'Active Guest' : 'គណនីរបស់អ្នក'}
                </span>
              </div>
              <span className="font-extrabold text-xs text-indigo-300 block">{authedUser?.name}</span>
              <button
                onClick={handleLogout}
                className="text-[10px] text-rose-450 hover:text-rose-400 font-bold flex items-center gap-1 transition mt-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Log Out Portal' : 'ចាកចេញពីគណនី'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER LOGIN / REGISTER PORTAL IF NOT LOGGED IN */}
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Header Accent */}
          <div className="bg-indigo-600/10 p-5 border-b border-slate-800 flex flex-col items-center text-center space-y-2">
            <Lock className="w-6 h-6 text-indigo-400 mb-1" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Bilingual Guest Access</span>
            <h3 className="text-md font-black text-white">
              {lang === 'en' ? 'Login or Create Guest Account' : 'ចូលគណនី ឬចុះឈ្មោះភ្ញៀវថ្មី'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {lang === 'en' ? 'Connect via Telegram widget, Facebook verification, or custom password' : 'ភ្ជាប់តាមរយៈតេឡេក្រាម ហ្វេសប៊ុក ឬលេខសម្ងាត់ផ្ទាល់ខ្លួន'}
            </p>
          </div>

          {/* Social Providers Tab Selector */}
          <div className="grid grid-cols-3 border-b border-slate-800/60 text-center text-xs font-bold font-mono">
            <button
              onClick={() => { setAuthMethod('password'); setShowRegisterForm(false); }}
              className={`py-3.5 border-r border-slate-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'password' ? 'bg-indigo-600/10 text-white border-b-2 border-b-indigo-505' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>PASSWORD</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod('facebook')}
              className={`py-3.5 border-r border-slate-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'facebook' ? 'bg-blue-600/10 text-white border-b-2 border-b-blue-500' : 'text-indigo-400 hover:text-indigo-305'
              }`}
            >
              <Facebook className="w-3.5 h-3.5 fill-current" />
              <span>FACEBOOK</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod('telegram')}
              className={`py-3.5 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'telegram' ? 'bg-cyan-600/10 text-white border-b-2 border-b-cyan-500' : 'text-cyan-400 hover:text-cyan-305'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>TELEGRAM</span>
            </button>
          </div>

          <div className="p-6">
            
            {/* 1. PASSWORD AUTH METHOD */}
            {authMethod === 'password' && (
              <form onSubmit={handleClassicSubmit} className="space-y-4 text-xs font-mono">
                {showRegisterForm ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Full Name / ឈ្មោះពេញ</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sok Mean"
                        value={passwordFullName}
                        onChange={(e) => setPasswordFullName(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Phone / លេខទូរស័ព្ទ</label>
                      <input
                        type="tel"
                        required
                        placeholder="+855 12 345 678"
                        value={passwordPhone}
                        onChange={(e) => setPasswordPhone(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-indigo-500/5 text-indigo-300 font-sans leading-relaxed text-[10px] rounded-xl border border-indigo-500/10 mb-2">
                    💡 {lang === 'en' ? 'Tip: You can login with email "sokmean@gmail.com" and any mock password.' : 'គន្លឹះ៖ អាចចូលបានជាមួយអ៊ីមែល "sokmean@gmail.com" និងលេខសម្ងាត់ណាមួយ។'}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Email Address / អ៊ីមែល</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sokmean@gmail.com"
                    value={passwordEmail}
                    onChange={(e) => setPasswordEmail(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Secure Password / លេខសម្ងាត់</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordPass}
                    onChange={(e) => setPasswordPass(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-extrabold rounded-xl transition cursor-pointer"
                >
                  {showRegisterForm 
                    ? (lang === 'en' ? 'Create Account & Log In' : 'បង្កើតគណនី និងចូលស្នាក់នៅ')
                    : (lang === 'en' ? 'Secure Log In with Password' : 'ចូលគណនីដោយសុវត្ថិភាព')}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(!showRegisterForm)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-sans"
                  >
                    {showRegisterForm 
                      ? (lang === 'en' ? "Already have a password? Login instead" : "មានគណនីរួចហើយ? ចូលគណនី")
                      : (lang === 'en' ? "Don't have a password profile? Sign up here" : "មិនទាន់មានគណនីមែនទេ? ចុះឈ្មោះទីនេះ")}
                  </button>
                </div>
              </form>
            )}

            {/* 2. FACEBOOK SECURE VERIFIED LOG IN */}
            {authMethod === 'facebook' && (
              <form onSubmit={handleFacebookLoginSubmit} className="space-y-4 text-xs font-mono">
                <div className="bg-blue-600/5 border border-blue-500/10 p-3 rounded-xl flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="font-sans text-[10px] text-indigo-200 leading-normal">
                    {lang === 'en' 
                      ? 'Integrate with Facebook Login Widget helper. Live OAuth scope grabs public profile name & phone securely.'
                      : 'ការចូលគណនីហ្វេសប៊ុក សុវត្ថិភាពខ្ពស់ មិនចែករំលែកព័ត៌មានឯកជនរបស់អ្នកឡើយ។'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Facebook Username / Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +855 85 555 123"
                    value={fbEmail}
                    onChange={(e) => setFbEmail(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Facebook Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={fbPassword}
                    onChange={(e) => setFbPassword(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={fbConnecting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-sans font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                  <span>{fbConnecting ? (lang === 'en' ? 'Verifying OAuth Token...' : 'កំពុងផ្ទៀងផ្ទាត់...') : (lang === 'en' ? 'Log In with Facebook' : 'ចូលគណនីតាមហ្វេសប៊ុក')}</span>
                </button>
              </form>
            )}

            {/* 3. TELEGRAM VERIFIED LOGIN */}
            {authMethod === 'telegram' && (
              <form onSubmit={handleTelegramLoginSubmit} className="space-y-4 text-xs font-mono">
                <div className="bg-cyan-600/5 border border-cyan-500/10 p-3 rounded-xl flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="font-sans text-[10px] text-cyan-200 leading-normal">
                    <span className="font-bold block mb-0.5">Telegram Instant Bot Login</span>
                    {lang === 'en' 
                      ? 'Securely authenticate using Telegram widget token API. Verification passcode is forwarded directly.'
                      : 'ការផ្ទៀងផ្ទាត់រហ័ស និងសុវត្ថិភាពខ្ពស់ តាមរយៈលេខកូដសម្ងាត់តេឡេក្រាមប្រចាំគណនី។'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Telegram Handle / Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @SokMean_Telegram"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase tracking-wider block text-[9px]">Telegram Password / Verification Code</label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. 5-Digit OTP"
                    value={telegramPassword}
                    onChange={(e) => setTelegramPassword(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-850 py-2 px-3 text-slate-200 rounded-lg outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={telegramPopupStep}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="text-xs">✈️</span>
                  <span>{telegramPopupStep ? (lang === 'en' ? 'Verifying Telegram payload...' : 'កំពុងចូលគណនី...') : (lang === 'en' ? 'Log In with Telegram Account' : 'ចូលគណនីតាមតេឡេក្រាម')}</span>
                </button>
              </form>
            )}

            {/* Privacy Compliance Lock Badge */}
            <div className="mt-5 pt-3 border-t border-slate-800 text-center flex items-center justify-center gap-1.5 text-[9px] text-slate-550 font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'en' ? 'Encrypted Secure Gateway' : 'ការតភ្ជាប់មានការការពារ និងសម្ងាត់'}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ACCESSIBLE BOOKING PORTAL WORKFLOW (DASHBOARD FOR GUEST IF LOGGED IN) */
        <div className="space-y-8">

          {/* Main Direct Portal Tab Switcher */}
          {viewState === 'browse' && (
            <div className="flex bg-[#111c30]/85 p-1.5 rounded-2xl border border-slate-700/50 max-w-sm">
              <button
                type="button"
                onClick={() => setPortalTab('booking')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  portalTab === 'booking' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en' ? 'Book a Room' : 
                   lang === 'kh' ? 'កក់បន្ទប់' :
                   lang === 'vi' ? 'Đặt phòng' :
                   lang === 'ch' ? '预订客房' : '部屋予約'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPortalTab('feedback')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  portalTab === 'feedback' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>
                  {lang === 'en' ? 'My Feedback' : 
                   lang === 'kh' ? 'មតិយោបល់ខ្ញុំ' :
                   lang === 'vi' ? 'Ý kiến của tôi' :
                   lang === 'ch' ? '住宿反馈' : '私のレビュー'}
                </span>
              </button>
            </div>
          )}
          
          {/* RENDER BROWSE VIEW */}
          {viewState === 'browse' && portalTab === 'booking' && (
            <div className="space-y-6">
              
              {authedUser && authedUser.is_authorized && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 font-bold animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-400 tracking-tight leading-tight flex items-center gap-2">
                        <span>🛡️ {lang === 'en' ? 'Authorized Client Privilege Active' : 'សិទ្ធិពិសេសអតិថិជនមានសិទ្ធិត្រូវបានបើក'}</span>
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-1 leading-normal">
                        {lang === 'en' 
                          ? `Welcome back, ${authedUser.name}. As a verified ${authedUser.tier || 'Authorized'} tier guest, you qualify for an automatic ${authedUser.discount || 0}% price slash applied across all dates!`
                          : `សូមស្វាគមន៍ត្រឡប់មកវិញ ភ្ញៀវ ${authedUser.name}។ ដោយសារគណនីរបស់អ្នកជាប្រភេទ [${authedUser.tier}] អ្នកទទួលបានការបញ្ចុះតម្លៃ ${authedUser.discount || 0}% ស្វ័យប្រវត្តិលើគ្រប់តម្លៃបន្ទប់ទាំងអស់!`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 bg-emerald-500/15 border border-emerald-500/25 py-1.5 px-3 rounded-lg w-full sm:w-auto">
                    <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block">{authedUser.tier} ACCOUNT</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono">{authedUser.discount}% SPECIAL DISCOUNT ACTIVE</span>
                  </div>
                </div>
              )}
              
              {/* Advanced Catalog Filters */}
              <div className="bg-[#111c30]/50 border border-slate-700/50 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                    {lang === 'en' ? 'Filter & Search Available Bed Spaces' : 'ស្វែងរកបន្ទប់ដែលទំនេរ'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Type selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                      {lang === 'en' ? 'Room Category' : 'ប្រភេទបន្ទប់'}
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700/60 text-xs py-2.5 px-3 rounded-xl text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      {roomTypes.map((t, idx) => (
                        <option key={idx} value={t}>{t === 'All' ? (lang === 'en' ? 'All Room Types' : 'គ្រប់ប្រភេទបន្ទប់') : t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Selector */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                      {lang === 'en' ? 'Floor Level' : 'ជាន់ស្នាក់នៅ'}
                    </label>
                    <select
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700/60 text-xs py-2.5 px-3 rounded-xl text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="All">{lang === 'en' ? 'All Floors' : 'គ្រប់ជាន់ស្នាក់នៅ'}</option>
                      <option value="1st">{lang === 'en' ? '1st Floor' : 'ជាន់ទី ១'}</option>
                      <option value="2nd">{lang === 'en' ? '2nd Floor' : 'ជាន់ទី ២'}</option>
                      <option value="3rd">{lang === 'en' ? '3rd Floor' : 'ជាន់ទី ៣'}</option>
                      <option value="4th">{lang === 'en' ? '4th Floor' : 'ជាន់ទី ៤'}</option>
                    </select>
                  </div>

                  {/* Max budget slider */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide">
                        {lang === 'en' ? 'Max Daily Budget' : 'វិសាលភាពថវិកាប្រចាំថ្ងៃ'}
                      </label>
                      <span className="text-xs font-bold text-emerald-400">${priceRange} USD</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="5"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* RENDER DYNAMIC ROOMS CATALOG GROUPED BY CATEGORIES (each with description, price and Unsplash high-res visual image) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRoomsCatalog.map((room) => (
                  <div 
                    key={room.id}
                    className="bg-[#111c30]/50 border border-slate-700/50 hover:border-indigo-500/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 group shadow-lg"
                  >
                    {/* Visual Unsplash Image with fallback */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img 
                        src={ROOM_IMAGES[room.type] || DEFAULT_ROOM_IMAGE} 
                        alt={room.type} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Dark overlay for typography protection */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      
                      {/* Top ribbon info badge */}
                      <div className="absolute right-3.5 top-3.5 bg-slate-900/85 text-amber-400 border border-amber-400/25 px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{room.type.includes('VIP') ? 'PREMIUM VIP' : 'DELUXE SUITE'}</span>
                      </div>

                      {/* Bottom title inside picture */}
                      <div className="absolute bottom-3.5 left-4">
                        <span className="text-[9px] text-indigo-305 uppercase font-mono tracking-widest block font-bold">Suite Room Space</span>
                        <h4 className="text-lg font-black text-white leading-none mt-1">Suite R-{room.room_no}</h4>
                      </div>
                    </div>

                    {/* Amenities list */}
                    <div className="p-4 bg-slate-900/40 border-b border-slate-800/60 grid grid-cols-4 gap-2 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center p-1 bg-slate-950/20 rounded-lg">
                        <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[8px] font-mono mt-1">Free WiFi</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-slate-950/20 rounded-lg">
                        <Wind className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-[8px] font-mono mt-1">A/C Air</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-slate-950/20 rounded-lg">
                        <Tv className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[8px] font-mono mt-1">Smart TV</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-slate-950/20 rounded-lg">
                        <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[8px] font-mono mt-1">Kitchen</span>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="p-5 pt-3.5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Distinct Room Category label */}
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded">
                            {room.type}
                          </span>
                          <span className="text-slate-400 text-[11px] font-mono">
                            {lang === 'en' ? 'Floor' : 'ជាន់ទី'} <b className="text-white">{room.floor}</b>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{room.capacity} {lang === 'en' ? 'Max Guests Capacity' : 'ចំណុះភ្ញៀវអតិបរមា'}</span>
                        </div>
                      </div>

                      {/* Pricing and Booking Button */}
                      <div className="flex justify-between items-end border-t border-slate-800/60 pt-3">
                        <div>
                          <span className="text-[8px] text-slate-450 uppercase tracking-widest block">{lang === 'en' ? 'Daily Price' : 'តម្លៃលក់ក្នុងមួយថ្ងៃ'}</span>
                          {authedUser && authedUser.discount ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-bold line-through font-mono leading-none">
                                ${room.daily_price} USD
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xl font-black text-emerald-400 leading-none">
                                  ${Math.round(room.daily_price * (1 - authedUser.discount / 100))}
                                </span>
                                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono font-bold px-1 rounded">
                                  -{authedUser.discount}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-xl font-extrabold text-emerald-400">${room.daily_price}</span>
                              <span className="text-[9px] text-slate-450 uppercase font-mono">USD</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRoom(room)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 group-hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{lang === 'en' ? 'Book Suite' : 'កក់បន្ទប់នេះ'}</span>
                          <ChevronRight className="w-3.5 h-3.5 transform transition group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {availableRoomsCatalog.length === 0 && (
                  <div className="col-span-full py-16 bg-[#111c30]/20 border border-slate-700/30 rounded-2xl text-center text-slate-400">
                    <Info className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-slate-250">{lang === 'en' ? 'No Available Rooms Found' : 'រកមិនឃើញបន្ទប់ទទេទេ'}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      {lang === 'en' 
                        ? 'All rooms matching your active filters are currently occupied or reserved. Try readjusting the daily budget limit!'
                        : 'បន្ទប់ទាំងអស់ដែលត្រូវគ្នានឹងតម្រងសកម្មរបស់អ្នកកំពុងមានភ្ញៀវស្នាក់នៅឬកក់អស់ហើយ។ សូមព្យាយាមកែសម្រួលតម្លៃថវិកាប្រចាំថ្ងៃឡើងវិញ!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RENDER FEEDBACK VIEW */}
          {viewState === 'browse' && portalTab === 'feedback' && (
            <div className="bg-[#111c30]/50 border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    {lang === 'en' ? 'Review & Feedback Portal' : 
                     lang === 'kh' ? 'ប្រព័ន្ធមតិយោបល់ភ្ញៀវ' : 
                     lang === 'vi' ? 'Cổng đánh giá & Ý kiến' : 
                     lang === 'ch' ? '顾客意见反馈' : 'ゲストレビュー＆フィードバック'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'en' ? 'Tell us about your stay experience. Feedback appears in the hotel CRM instantly.' : 
                     lang === 'kh' ? 'សូមចែករំលែកបទពិសោធន៍របស់អ្នក។ មតិយោបល់របស់អ្នកនឹងត្រូវបានបញ្ជូនទៅផ្នែកគ្រប់គ្រងភ្លាមៗ។' : 
                     lang === 'vi' ? 'Hãy chia sẻ trải nghiệm lưu trú của bạn. Ý kiến sẽ được gửi ngay đến bộ phận quản lý.' : 
                     lang === 'ch' ? '分享您的住宿体验。您的意见将立即显示在服务系统中。' : 'ご滞在の感想をお聞かせください。フィードバックは即座にCRMに反映されます。'}
                  </p>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!feedbackComment.trim()) {
                    triggerToast(
                      lang === 'en' ? 'Please fill in comments fields!' : 
                      lang === 'kh' ? 'សូមបំពេញព័ត៌មានមតិយោបល់!' : 
                      lang === 'vi' ? 'Vui lòng cung cấp ý kiến!' : 
                      lang === 'ch' ? '请填写意见反馈内容!' : 'コメントを入力してください！'
                    );
                    return;
                  }

                  const newId = crmNotes.length > 0 ? Math.max(...crmNotes.map(n => n.id)) + 1 : 1;
                  const stars = '★'.repeat(feedbackRating) + '☆'.repeat(5 - feedbackRating);
                  const refInfo = feedbackTargetRes === 'general' ? 'General Stay' : `Res #${feedbackTargetRes}`;
                  
                  const noteMsg = `[Guest Rating: ${stars} (${feedbackRating}/5 stars) | Reference: ${refInfo}]\n\n${feedbackComment.trim()}`;

                  const feedbackEntry: CrmNote = {
                    id: newId,
                    name: authedUser?.name || 'Portal Guest',
                    type: feedbackRating <= 2 ? 'Complaint' : 'Note',
                    message: noteMsg,
                    status: 'Pending',
                    date: new Date().toISOString().split('T')[0]
                  };

                  setCrmNotes([feedbackEntry, ...crmNotes]);
                  setFeedbackComment('');
                  setFeedbackRating(5);
                  setFeedbackTargetRes('general');
                  triggerToast(
                    lang === 'en' ? '✓ Thank you! Your feedback has been logged in our CRM.' : 
                    lang === 'kh' ? '✓ សូមអរគុណ! មតិយោបល់របស់អ្នកត្រូវបានកត់ត្រាទុកក្នុង CRM រួចរាល់។' : 
                    lang === 'vi' ? '✓ Cảm ơn bạn! Ý kiến của bạn đã được ghi nhận trong hệ thống CRM.' : 
                    lang === 'ch' ? '✓ 感谢您！您的意见已被成功记录在CRM系统中。' : '✓ ありがとうございます！フィードバックがCRMシステムに登録されました。'
                  );
                }}
                className="space-y-4"
              >
                {/* 1. Target Stay Reservation Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                    {lang === 'en' ? 'Associate with Booking (Optional)' : 
                     lang === 'kh' ? 'ភ្ជាប់ជាមួយការកក់ទុក (មិនតម្រូវ)' : 
                     lang === 'vi' ? 'Liên kết với đặt phòng (Không bắt buộc)' : 
                     lang === 'ch' ? '关联预订（可选）' : '対象の予約に紐付ける（任意）'}
                  </label>
                  <select
                    value={feedbackTargetRes}
                    onChange={(e) => setFeedbackTargetRes(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700/60 text-xs py-2.5 px-3 rounded-xl text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"
                  >
                    <option value="general">
                      -- {lang === 'en' ? 'General Stay / No Booking ID' : 
                          lang === 'kh' ? 'ការស្នាក់នៅទូទៅ / គ្មានលេខកក់' : 
                          lang === 'vi' ? 'Trải nghiệm chung / Không có mã đặt phòng' : 
                          lang === 'ch' ? '常规住宿 / 无预订编号' : '一般的な滞在 / 予約IDなし'} --
                    </option>
                    {reservations
                      .filter(r => r.guest_name.toLowerCase().includes(authedUser?.name.toLowerCase() || ''))
                      .map((res, index) => (
                        <option key={index} value={res.id}>
                          Booking #{res.id} - Room {res.room_no} ({res.checkin} → {res.checkout})
                        </option>
                    ))}
                  </select>
                </div>

                {/* 2. Rating Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                    {lang === 'en' ? 'Rate Your Hospitality Experience' : 
                     lang === 'kh' ? 'វាយតម្លៃបទពិសោធន៍ស្នាក់នៅរបស់អ្នក' : 
                     lang === 'vi' ? 'Đánh giá chất lượng phục vụ' : 
                     lang === 'ch' ? '评分您的服务体验' : 'サービスの満足度'}
                  </span>
                  
                  <div className="flex items-center gap-2.5 bg-[#0a0f1d]/40 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starsIndex) => {
                        const isGlow = hoveredRating >= starsIndex || (!hoveredRating && feedbackRating >= starsIndex);
                        return (
                          <button
                            type="button"
                            key={starsIndex}
                            onMouseEnter={() => setHoveredRating(starsIndex)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setFeedbackRating(starsIndex)}
                            className="p-1 cursor-pointer transition transform hover:scale-125 duration-100"
                          >
                            <Star 
                              className={`w-7 h-7 text-xs ${
                                isGlow 
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' 
                                  : 'text-slate-600'
                              }`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                    
                    <span className="text-[11px] font-bold font-mono text-indigo-300">
                      {(() => {
                        const score = hoveredRating || feedbackRating;
                        if (score === 1) {
                          return lang === 'en' ? 'Poor' : 
                                 lang === 'kh' ? 'មិនល្អសោះ' : 
                                 lang === 'vi' ? 'Rất kém' : 
                                 lang === 'ch' ? '极不满意' : '不満';
                        }
                        if (score === 2) {
                          return lang === 'en' ? 'Disappointing' : 
                                 lang === 'kh' ? 'មិនសូវពេញចិត្ត' : 
                                 lang === 'vi' ? 'Kém' : 
                                 lang === 'ch' ? '不太满意' : 'やや不満';
                        }
                        if (score === 3) {
                          return lang === 'en' ? 'Good & Cozy' : 
                                 lang === 'kh' ? 'ល្អបង្គួរ' : 
                                 lang === 'vi' ? 'Tốt & Tiện nghi' : 
                                 lang === 'ch' ? '一般 / 还行' : '普通';
                        }
                        if (score === 4) {
                          return lang === 'en' ? 'Excellent Hospitality' : 
                                 lang === 'kh' ? 'ល្អណាស់' : 
                                 lang === 'vi' ? 'Rất tốt' : 
                                 lang === 'ch' ? '非常满意' : '満足';
                        }
                        return lang === 'en' ? 'Exquisite & Pristine Stay!' : 
                               lang === 'kh' ? 'ល្អឥតខ្ចោះ!' : 
                               lang === 'vi' ? 'Tuyệt vời & Sang trọng!' : 
                               lang === 'ch' ? '完美至极 / 极力推荐!' : '大変満足！';
                      })()}
                    </span>
                  </div>
                </div>

                {/* 3. Ticket type selection */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                    {lang === 'en' ? 'Feedback Category' : 
                     lang === 'kh' ? 'ប្រភេទមតិយោបល់' : 
                     lang === 'vi' ? 'Phân loại ý kiến' : 
                     lang === 'ch' ? '反馈类别' : 'フィードバックの分類'}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'Note', labelEn: 'General Feedback', labelKh: 'មតិយោបល់ទូទៅ', labelVi: 'Ý kiến chung', labelCh: '一般反馈', labelJp: '一般意見' },
                      { value: 'Complaint', labelEn: 'Complaint & Issue', labelKh: 'បណ្តឹងផ្សេងៗ', labelVi: 'Khiếu nại/Sự cố', labelCh: '投诉与建议', labelJp: 'クレーム・苦情' },
                      { value: 'Request', labelEn: 'Service Request', labelKh: 'សំណើសេវាកម្ម', labelVi: 'Yêu cầu phục vụ', labelCh: '服务需求', labelJp: 'サービス要望' },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => setFeedbackType(cat.value as any)}
                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold border transition cursor-pointer text-center ${
                          feedbackType === cat.value 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                            : 'bg-[#0a0f1d] border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lang === 'en' ? cat.labelEn : 
                         lang === 'kh' ? cat.labelKh : 
                         lang === 'vi' ? cat.labelVi : 
                         lang === 'ch' ? cat.labelCh : cat.labelJp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Feedback Comments Text Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wide block">
                    {lang === 'en' ? 'Your Review Comments (Required)' : 
                     lang === 'kh' ? 'សំណេរមតិយោបល់លម្អិត (តម្រូវ)' : 
                     lang === 'vi' ? 'Nội dung nhận xét (Bắt buộc)' : 
                     lang === 'ch' ? '您的意见反馈内容（必填）' : 'レビュー文（必須）'}
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={
                      lang === 'en' ? 'Describe your room comfort, staff services, cleanliness, or suggestions for us...' : 
                      lang === 'kh' ? 'ពិពណ៌នាអំពីបន្ទប់ សេវាកម្ម បុគ្គលិក ភាពស្អាត ឬអនុសាសន៍ផ្សេងៗ...' : 
                      lang === 'vi' ? 'Mô tả mức độ thoải mái, phục vụ của nhân viên, độ sạch sẽ hoặc đề xuất của bạn...' : 
                      lang === 'ch' ? '详细评价您的居住体验、房间卫生、服务态度及具体建议...' : 'お部屋の快適さ、スタッフの対応、清潔さなどへのご意見をご記入ください...'
                    }
                    className="w-full bg-[#0a0f1d] border border-slate-700/60 p-3 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-501 focus:border-indigo-500 transition resize-none font-medium leading-relaxed font-sans"
                    required
                  />
                </div>

                {/* 5. Button triggers */}
                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-indigo-600/10 transition leading-none cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {lang === 'en' ? 'Submit My Review' : 
                     lang === 'kh' ? 'ផ្ញើមតិយោបល់របស់ខ្ញុំ' : 
                     lang === 'vi' ? 'Gửi ý kiến đánh giá' : 
                     lang === 'ch' ? '提交意见反馈' : 'レビューを送信する'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* RENDER FORM VIEW */}
          {viewState === 'form' && selectedRoom && (
            <form onSubmit={handleFormSubmit} className="bg-[#111c30]/50 border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
              
              {/* Form Heading details */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Step 2 of 3</span>
                  <h3 className="font-extrabold text-white text-md">
                    {lang === 'en' ? 'Guest Identification & Prefill details' : 'បំពេញព័ត៌មានអត្តសញ្ញាណប័ណ្ណ និង កាលបរិច្ឆេទ'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewState('browse');
                    setSelectedRoom(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {lang === 'en' ? 'Change Room' : 'ប្តូរបន្ទប់'}
                </button>
              </div>

              {/* Selected Suite Info Banner */}
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={ROOM_IMAGES[selectedRoom.type] || DEFAULT_ROOM_IMAGE}
                    alt={selectedRoom.type}
                    referrerPolicy="no-referrer"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-800"
                  />
                  <div>
                    <span className="text-[8px] bg-indigo-500/15 text-indigo-305 px-2 py-0.5 rounded font-mono font-bold">{selectedRoom.type}</span>
                    <h4 className="font-extrabold text-white text-sm mt-1">Suite R-{selectedRoom.room_no}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Nightly Rate</span>
                  <span className="text-emerald-400 font-extrabold text-sm">${selectedRoom.daily_price} USD</span>
                </div>
              </div>

              {/* 2 Column Customer Field Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                
                {/* Personal Columns */}
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1.5 uppercase tracking-wide font-sans text-indigo-305">
                    {lang === 'en' ? 'Personal Information' : 'ព័ត៌មានផ្ទាល់ខ្លួន'}
                  </h4>

                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase block text-[9px] tracking-wider">
                      {lang === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'en' ? "e.g., Sok Mean" : "ឧទហរណ៍៖ សុខ ចាន់"}
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-205 focus:border-indigo-500 outline-none transition font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase block text-[9px] tracking-wider">
                        {lang === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+855 12 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-205 focus:border-indigo-500 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase block text-[9px] tracking-wider">
                        {lang === 'en' ? 'Email Address' : 'អ៊ីមែល'}
                      </label>
                      <input
                        type="email"
                        placeholder="sokchan@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-205 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px] uppercase tracking-wider">
                        {lang === 'en' ? 'Passport / National ID' : 'អត្តសញ្ញាណប័ណ្ណ / លិខិតឆ្លងដែន'}
                      </label>
                      <input
                        type="text"
                        placeholder="N01234567"
                        value={idPassport}
                        onChange={(e) => setIdPassport(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-205 focus:border-indigo-500 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px] uppercase tracking-wider">
                        {lang === 'en' ? 'Emergency Contact' : 'ទំនាក់ទំនងបន្ទាន់'}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'en' ? "e.g., Mother (+855 88 123)" : "ឧទាហរណ៍៖ ម្ដាយ (+855 88 123)"}
                        value={emergency}
                        onChange={(e) => setEmergency(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-300 focus:border-indigo-500 outline-none transition font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Selection Columns */}
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1.5 uppercase tracking-wide font-sans text-indigo-305">
                    {lang === 'en' ? 'Check-In Scheduling' : 'ការកំណត់ពេលវេលាចូលស្នាក់នៅ'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase block text-[9px] tracking-wider">
                        {lang === 'en' ? 'Check-In Date' : 'ថ្ងៃចូលស្នាក់នៅ'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={checkin}
                        onChange={(e) => setCheckin(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-205 focus:border-indigo-505 outline-none transition cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase block text-[9px] tracking-wider">
                        {lang === 'en' ? 'Check-Out Date' : 'ថ្ងៃចាកចេញ'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={checkout}
                        onChange={(e) => setCheckout(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700 text-xs py-2.5 px-3.5 rounded-xl text-slate-205 focus:border-indigo-505 outline-none transition cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Payment Requirement Selection (Upfront Payment Requirement) */}
                  <div className="space-y-2 bg-[#070b13] p-4 rounded-2xl border border-slate-800">
                    <label className="text-slate-300 font-bold uppercase tracking-wider block text-[9px] font-sans">
                      ⚠️ {lang === 'en' ? 'Upfront Prepayment Options (Required)' : 'លក្ខខណ្ឌការបង់ប្រាក់មុន (តម្រូវជាដាច់ខាត)'}
                    </label>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans mb-3.5">
                      {lang === 'en' 
                        ? 'Select an upfront payment option to guarantee the room booking. Free cancellation applies 24h prior.'
                        : 'សូមជ្រើសរើសលក្ខខណ្ឌការបង់ប្រាក់មុន ដើម្បីធានាបន្ទប់ស្នាក់នៅរបស់អ្នក។'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <button
                        type="button"
                        onClick={() => setPaymentPolicy('full')}
                        className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between h-20 ${
                          paymentPolicy === 'full' 
                            ? 'bg-emerald-550/10 border-emerald-500 font-bold text-white' 
                            : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-mono tracking-wider">Full 100% Prepay</span>
                        <div className="mt-1">
                          <span className="text-emerald-400 font-sans font-bold block text-xs">${grandTotal} USD</span>
                          <span className="text-[8px] opacity-75 font-sans leading-none block">Confirm immediately</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentPolicy('deposit')}
                        className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between h-20 ${
                          paymentPolicy === 'deposit' 
                            ? 'bg-indigo-550/10 border-indigo-500 font-bold text-white' 
                            : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-mono tracking-wider">30% Small Deposit</span>
                        <div className="mt-1">
                          <span className="text-indigo-300 font-sans font-bold block text-xs">${Math.round(grandTotal * 0.3)} USD</span>
                          <span className="text-[8px] opacity-75 font-sans leading-none block">Pay partial rest on stay</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewState('browse');
                    setSelectedRoom(null);
                  }}
                  className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-bold font-sans text-xs rounded-xl transition cursor-pointer"
                >
                  {lang === 'en' ? 'Back' : 'ថយក្រោយ'}
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-sans font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'en' ? 'Proceed to Settle Upfront' : 'បន្តទៅបង់ប្រាក់'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* RENDER PAYMENT DEPOSIT VIEW (Mocking Cambodia ABA Pay and Riels conversion) */}
          {viewState === 'payment' && selectedRoom && (
            <div className="bg-[#111c30]/50 border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-lg max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <span className="bg-emerald-500/10 text-emerald-400 font-extrabold px-3.5 py-1 rounded-full text-[9px] uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Secured KHQR Gateway' : 'ប្រព័ន្ធទូទាត់សុវត្ថិភាព KHQR'}
                </span>
                
                <h3 className="font-extrabold text-white text-md">
                  {lang === 'en' ? 'Verify & Authorize Room Upfront Prepayment' : 'ផ្ទៀងផ្ទាត់ និង យល់ព្រមបង់ប្រាក់មុន'}
                </h3>
                
                <p className="text-slate-400 text-[11px] px-4">
                  {lang === 'en' 
                    ? `To secure Suite R-${selectedRoom.room_no} from check-in dates ${checkin} to ${checkout}, please settle the required upfront prepayment.`
                    : `ដើម្បីធានាការកក់បន្ទប់ Suite R-${selectedRoom.room_no} ចាប់ពីថ្ងៃ ${checkin} ដល់ ${checkout} សូមធ្វើការទូទាត់ប្រាក់មុនជាមុនសិន។`}
                </p>
              </div>

              {/* Interactive QR representation box */}
              <div className="bg-slate-900 border border-slate-805 rounded-2xl p-5 text-center space-y-4">
                
                {/* Visual ABA representation headers */}
                <div className="flex justify-between items-center bg-[#070b13] p-3 rounded-xl border border-slate-805">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-650 rounded-lg flex items-center justify-center font-black text-white text-xs tracking-wider">
                      ABA
                    </div>
                    <div className="text-left font-mono leading-none">
                      <span className="text-[8px] text-slate-500 block uppercase font-sans">Payment Mode</span>
                      <span className="text-[10px] text-slate-200 font-bold block mt-0.5">ABA KHQR Pay (Cambodia)</span>
                    </div>
                  </div>
                  
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    KHQR Active
                  </span>
                </div>

                {/* Computed sum indicators */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 block font-bold">
                    {paymentPolicy === 'full' ? 'FULL UPFRONT PAYMENT' : 'COMMITMENT DEPOSIT (30%)'}
                  </span>
                  
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2.5xl font-black text-emerald-400">${requiredAmount}</span>
                    <span className="text-xs font-bold text-slate-450 font-mono">USD</span>
                  </div>
                  
                  <div className="text-xs text-indigo-305 font-bold font-mono">
                    ≈ {paymentInRiel.toLocaleString()} KHR (៛)
                  </div>
                </div>

                {/* Generated KHQR code with cross-origin referrer policy bypass */}
                <div className="flex justify-center my-3">
                  <div className="p-3 bg-white rounded-2xl border border-slate-300 flex items-center justify-center hover:scale-105 transform transition duration-300">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `aba://payment?account=001235678&amount=${requiredAmount}&currency=USD&nickname=SoryaGuesthouse`
                      )}`} 
                      alt="Commitment Upfront Payment QR"
                      className="w-32 h-32"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <p className="text-[9px] text-slate-450 leading-normal max-w-xs mx-auto">
                  {lang === 'en' 
                    ? 'Scan the dynamic KHQR code with your ABA Mobile, Acleda or any Bakong App. After scanning, hit the verification button below.'
                    : 'ស្កេនកូដ KHQR តាមកម្មវិធី ABA Mobile, Acleda ឬកម្មវិធី Bakong ណាមួយ។ បន្ទាប់ពីស្កេនរួច សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទៀងផ្ទាត់។'}
                </p>
              </div>

              {/* Payment actions footer */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConfirmReservationWithPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs font-mono rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-250 animate-pulse" />
                  <span>{lang === 'en' ? 'PAY & AUTHORIZE ROOM NOW' : 'បង់ប្រាក់ និង ធានាបន្ទប់ឥឡូវនេះ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewState('form')}
                  className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-350 text-[11px] font-semibold rounded-xl transition cursor-pointer"
                >
                  {lang === 'en' ? 'Back' : 'ថយក្រោយ'}
                </button>
              </div>

            </div>
          )}

          {/* RENDER SUCCESS VIEW */}
          {viewState === 'success' && createdReservation && selectedRoom && (
            <div className="bg-[#111c30]/50 border border-emerald-500/25 p-6 md:p-8 rounded-2xl shadow-xl max-w-xl mx-auto space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-6 h-6 animate-pulse text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-white text-md">
                  {lang === 'en' ? 'Online Room Reservation Confirmed!' : 'ការកក់បន្ទប់ត្រូវបានផ្ញើដោយជោគជ័យ!'}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {lang === 'en' 
                    ? `Thank you, ${guestName}! Your room registration has been confirmed with upfront payment into the Sorya database.`
                    : `អរគុណ ${guestName}! ការកក់បន្ទប់សម្រាប់បន្ទប់លេខ R-${selectedRoom.room_no} ត្រូវបានធានាជោគជ័យ។`}
                </p>
              </div>

              {/* Core Reciprocated Reservation Badge Card values */}
              <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-4 text-xs font-mono text-left space-y-2.5 leading-none">
                <div className="flex justify-between border-b border-slate-800 pb-2 mb-1">
                  <span className="text-slate-500 font-bold uppercase font-sans text-[10px]">RESERVATION SECURED PASS</span>
                  <span className="text-indigo-400 font-bold">#REG-2026-{createdReservation.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">{lang === 'en' ? 'Guest Profile' : 'ឈ្មោះភ្ញៀវ'}</span>
                  <span className="text-white font-bold">{guestName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">{lang === 'en' ? 'Allotted Space' : 'លេខបន្ទប់'}</span>
                  <span className="text-indigo-300 font-bold">R-{selectedRoom.room_no} ({selectedRoom.type})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">{lang === 'en' ? 'Arrival (In)' : 'ថ្ងៃចូលស្នាក់នៅ'}</span>
                  <span className="text-slate-200">{checkin}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">{lang === 'en' ? 'Departure (Out)' : 'ថ្ងៃចាកចេញ'}</span>
                  <span className="text-slate-200">{checkout}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">{lang === 'en' ? 'Total stay fee' : 'តម្លៃសរុបបន្ទប់'}</span>
                  <span className="text-slate-200">${grandTotal} USD</span>
                </div>

                <div className="flex justify-between border-t border-slate-800 pt-2 text-[10px]">
                  <span className="text-slate-450 uppercase font-sans font-bold">{lang === 'en' ? 'Amount Paid Upfront' : 'ប្រាក់ដែលបានបង់មុន'}</span>
                  <span className="text-emerald-400 font-bold">${requiredAmount} USD</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-301 rounded-xl text-left leading-normal flex items-start gap-2.5">
                <QrCode className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wide block mb-0.5">{lang === 'en' ? 'How to check-in on arrival?' : 'របៀបចូលស្នាក់នៅពេលមកដល់?'}</span>
                  <p>
                    {lang === 'en' 
                      ? "Your booking is marked in the system as confirmed and pre-paid. Staff will simply scan your voucher ID or match your identification on arrival date."
                      : "ការកក់របស់អ្នកត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធថាបានទូទាត់មុន និងបញ្ជាក់រួចរាល់។ បុគ្គលិកនឹងធ្វើការឆែកអមដំណើរភ្ញៀវពេលមកដល់តែម្តង។"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewState('browse');
                    setSelectedRoom(null);
                    setCreatedReservation(null);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {lang === 'en' ? 'Book Another Room' : 'កក់បន្ទប់បន្ថែមទៀត'}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
