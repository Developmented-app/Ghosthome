import React, { useState, useRef } from 'react';
import { Guest } from '../types';
import { UserPlus, Search, Phone, Mail, FileText, Trash2, Heart, QrCode, Printer, Copy, Check, X, Download, Table, LayoutGrid, Edit, Shield, Camera, Sparkles, RefreshCw, Eye } from 'lucide-react';

interface GuestManagementProps {
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function GuestManagement({ guests, setGuests, lang, t, triggerToast }: GuestManagementProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGuestForQr, setSelectedGuestForQr] = useState<Guest | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Bulk selection and layout states
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Form States for Guest
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idPassport, setIdPassport] = useState('');
  const [email, setEmail] = useState('');
  const [emergency, setEmergency] = useState('');
  const [history, setHistory] = useState('New Profile registered.');
  const [tier, setTier] = useState<'Standard' | 'VIP' | 'Authorized'>('Standard');
  const [discount, setDiscount] = useState<number>(0);

  // Simulated OCR & Real Camera Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [ocrState, setOcrState] = useState<'idle' | 'initializing' | 'scanning' | 'extracting' | 'completed'>('idle');
  const [ocrLog, setOcrLog] = useState<string>('');
  const [mockIdIndex, setMockIdIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const sampleOcrProfiles = [
    {
      name: "Sokha Vann",
      phone: "+855 92 888 123",
      idPassport: "KH0982736",
      email: "sokha.vann@outlook.kh",
      emergency: "Vann Sareth (+855 12 999 888)",
      remarks: "[OCR Scanned - Cambodia ID] Registered via automated document intelligence reader."
    },
    {
      name: "Marcus Aurelius",
      phone: "+1 512 809 3123",
      idPassport: "US5430291",
      email: "marcus.aurelius@rome.edu",
      emergency: "Faustina Aurelius (+1 512 809 3000)",
      remarks: "[OCR Scanned - US Passport] International guest ID verified. High Loyalty status."
    },
    {
      name: "Akara Sopheak",
      phone: "+855 15 444 777",
      idPassport: "KH0012938",
      email: "akarasopheak@gmail.com",
      emergency: "Keo Sopheak (+855 15 444 778)",
      remarks: "[OCR Scanned - Cambodia Resident Card] Verified resident. Prefers quiet corner suites."
    },
    {
      name: "Yuki Tanaka",
      phone: "+81 90 1234 5678",
      idPassport: "JP8827361",
      email: "yuki.tanaka@tokyolodge.jp",
      emergency: "Tanaka Sato (+81 90 1234 5679)",
      remarks: "[OCR Scanned - Japan Passport] Pre-registered business visitor. Express check-in."
    },
    {
      name: "Nari Nguyen",
      phone: "+84 908 123 456",
      idPassport: "VN2093817",
      email: "nari.nguyen@vietmail.vn",
      emergency: "Nguyen Huy (+84 908 123 457)",
      remarks: "[OCR Scanned - Vietnam ID Card] Checked & OCR validated."
    }
  ];

  const startCamera = async () => {
    setOcrState('initializing');
    setOcrLog(lang === 'en' ? 'Starting camera hardware...' : 'កំពុងបើកដំណើរការកាមេរ៉ា...');
    
    // Stop any existing tracks first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setCameraActive(true);
      setOcrState('scanning');
      setOcrLog(lang === 'en' ? 'Align ID/Passport card inside the viewfinder' : 'សូមតម្រឹមអត្តសញ្ញាណប័ណ្ណ ឬលិខិតឆ្លងដែនក្នុងស៊ុមស្កេន');
      
      // Delay slightly to allow state to render the video tag
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.warn("Camera request could not be fulfilled. Falling back to sandbox stream simulation.", err);
      setCameraActive(false);
      setOcrState('scanning');
      setOcrLog(lang === 'en' ? 'Simulator Active: Aligning synthetic document matrix' : 'ម៉ាស៊ីនស្ទង់និម្មិត៖ កំពុងតម្រឹមឯកសារគំរូ');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setOcrState('idle');
  };

  const triggerOcrScan = () => {
    if (ocrState !== 'scanning') return;
    
    setOcrState('extracting');
    setOcrLog(lang === 'en' ? 'Extracting text blocks via neural OCR engine...' : 'កំពុងទាញយកអត្ថបទជាមួយបច្ចេកវិទ្យា OCR ...');
    
    setTimeout(() => {
      setOcrLog(lang === 'en' ? 'Decrypting Machine Readable Zone (MRZ)...' : 'កំពុងបកស្រាយកូដម៉ាស៊ីនអាន (MRZ)...');
    }, 800);

    setTimeout(() => {
      const targetProfile = sampleOcrProfiles[mockIdIndex];
      // Move to next mock ID for next scan so it cycles!
      setMockIdIndex((prev) => (prev + 1) % sampleOcrProfiles.length);

      // Prepopulate
      setName(targetProfile.name);
      setPhone(targetProfile.phone);
      setIdPassport(targetProfile.idPassport);
      setEmail(targetProfile.email);
      setEmergency(targetProfile.emergency);
      setHistory(targetProfile.remarks);

      setOcrState('completed');
      setOcrLog(lang === 'en' ? `Success! Loaded profile for ${targetProfile.name}` : `ជោគជ័យ! បានបញ្ចូលព័ត៌មានរបស់ ${targetProfile.name}`);
      
      triggerToast(lang === 'en' 
        ? `✓ OCR Scanned: Loaded profile for ${targetProfile.name}` 
        : `✓ ស្កេន OCR ជោគជ័យ៖ បានបញ្ចូលព័ត៌មានរបស់ ${targetProfile.name}`
      );

      // Finish & Close scanner
      setTimeout(() => {
        stopCamera();
        setIsScanning(false);
      }, 1200);
    }, 2000);
  };

  // Edit Guest States
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState<Guest | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIdPassport, setEditIdPassport] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmergency, setEditEmergency] = useState('');
  const [editHistory, setEditHistory] = useState('');
  const [editTier, setEditTier] = useState<'Standard' | 'VIP' | 'Authorized'>('Standard');
  const [editDiscount, setEditDiscount] = useState<number>(0);

  const openEditModal = (guest: Guest) => {
    setSelectedGuestForEdit(guest);
    setEditName(guest.name);
    setEditPhone(guest.phone);
    setEditIdPassport(guest.id_passport);
    setEditEmail(guest.email || '');
    setEditEmergency(guest.emergency || '');
    setEditHistory(guest.history || 'New Profile registered.');
    setEditTier(guest.tier || 'Standard');
    setEditDiscount(guest.discount || 0);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim() || !editIdPassport.trim()) {
      triggerToast(t('validationError'));
      return;
    }

    setGuests(prev => prev.map(g => {
      if (g.id === selectedGuestForEdit?.id) {
        return {
          ...g,
          name: editName.trim(),
          phone: editPhone.trim(),
          id_passport: editIdPassport.trim(),
          email: editEmail.trim(),
          emergency: editEmergency.trim(),
          history: editHistory.trim(),
          tier: editTier,
          discount: editDiscount,
          is_authorized: editTier !== 'Standard'
        };
      }
      return g;
    }));

    setSelectedGuestForEdit(null);
    triggerToast(lang === 'en'
      ? `Updated guest ${editName} profile & privileges successfully.`
      : `បានធ្វើបច្ចុប្បន្នភាពគណនីភ្ញៀវ ${editName} និងសិទ្ធិពិសេសជោគជ័យ។`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !idPassport.trim()) {
      triggerToast(t('validationError'));
      return;
    }

    const created: Guest = {
      id: guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1,
      name: name.trim(),
      phone: phone.trim(),
      id_passport: idPassport.trim(),
      email: email.trim(),
      emergency: emergency.trim(),
      history: history.trim(),
      tier: tier,
      discount: discount,
      is_authorized: tier !== 'Standard'
    };

    setGuests([...guests, created]);
    stopCamera();
    setIsScanning(false);
    setShowAddModal(false);
    triggerToast(`Guest ${created.name} registered successfully.`);

    // Reset Form
    setName('');
    setPhone('');
    setIdPassport('');
    setEmail('');
    setEmergency('');
    setHistory('New Profile registered.');
    setTier('Standard');
    setDiscount(0);
  };

  const removeGuest = (id: number, gName: string) => {
    setGuests(guests.filter(g => g.id !== id));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    triggerToast(`Removed profile for ${gName}.`);
  };

  const filtered = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.phone.includes(search) || 
    g.id_passport.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredIds = filtered.map(g => g.id);
  const areAllFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (areAllFilteredSelected) {
      // Deselect all filtered guests
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered guests
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const exportSelectedGuests = () => {
    const selectedGuests = guests.filter(g => selectedIds.includes(g.id));
    if (selectedGuests.length === 0) return;

    // Generate CSV content
    const headers = ['ID', 'Name', 'Phone', 'Email', 'ID Passport', 'Emergency Contact', 'Remarks/History'];
    const rows = selectedGuests.map(g => [
      g.id,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.phone.replace(/"/g, '""')}"`,
      `"${(g.email || '').replace(/"/g, '""')}"`,
      `"${g.id_passport.replace(/"/g, '""')}"`,
      `"${(g.emergency || '').replace(/"/g, '""')}"`,
      `"${(g.history || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `guesthouse_selected_guests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Exported ${selectedGuests.length} guest records successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Upper bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('guestManagement')}</h2>
          <p className="text-xs text-slate-400">View and archive customer indexes, incident notes, and emergency points.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('registerGuest')}</span>
        </button>
      </div>

      {/* Styled Search Filter & Modular View Toggle Controls */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
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

        {/* Layout switching trigger buttons and Bulk Deselection quick-link */}
        <div className="flex items-center justify-between sm:justify-end gap-3 font-medium">
          <button
            onClick={toggleSelectAll}
            className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-150 ${
              areAllFilteredSelected 
                ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400' 
                : 'bg-[#131e35] border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {areAllFilteredSelected ? (lang === 'en' ? 'Deselect All' : 'លុបការជ្រើសរើសទាំងអស់') : (lang === 'en' ? 'Select All Filtered' : 'ជ្រើសរើសទាំងអស់')}
          </button>

          <div className="bg-slate-900/80 p-0.5 rounded-xl border border-slate-700/80 flex items-center shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              title={lang === 'en' ? 'Table Layout' : 'ប្លង់តារាង'}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title={lang === 'en' ? 'Card Layout' : 'ប្លង់កាត'}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* RENDER GUEST MANAGEMENT TABLE VIEW */
        <div className="bg-slate-800/20 border border-slate-700/60 rounded-2xl overflow-hidden shadow-md animate-in fade-in duration-200">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={areAllFilteredSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="py-3.5 px-4">{t('guestName')}</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">ID Card / Passport</th>
                  <th className="py-3.5 px-4">Privilege & Rights (សិទ្ធិ)</th>
                  <th className="py-3.5 px-4">Emergency Contact</th>
                  <th className="py-3.5 px-4">Stay Audit Record</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filtered.map(g => {
                  const isSelected = selectedIds.includes(g.id);
                  return (
                    <tr 
                      key={g.id} 
                      className={`transition-colors duration-150 ${
                        isSelected ? 'bg-indigo-600/5 hover:bg-indigo-650/10' : 'hover:bg-slate-800/10'
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(g.id)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white uppercase text-xs shrink-0 shadow-sm">
                            {g.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className="block text-sm leading-tight text-slate-100">{g.name}</span>
                            <span className="text-[10px] text-indigo-300 font-mono mt-0.5 block">ID: {g.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{g.phone}</span>
                        </div>
                        {g.email && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Mail className="w-3.5 h-3.5 text-indigo-455 shrink-0" />
                            <span className="truncate max-w-[160px] block">{g.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                          {g.id_passport}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {g.tier === 'VIP' ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold px-2 py-0.5 rounded uppercase w-max tracking-wider">
                              👑 VIP Client
                            </span>
                            {g.discount ? (
                              <span className="text-[9px] text-amber-300 font-mono mt-0.5 font-bold">{g.discount}% Privilege Discount</span>
                            ) : null}
                          </div>
                        ) : g.tier === 'Authorized' ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase w-max tracking-wide">
                              🛡️ Authorized
                            </span>
                            {g.discount ? (
                              <span className="text-[9px] text-emerald-300 font-mono mt-0.5 font-bold">{g.discount}% Auth Discount</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[10px] bg-slate-850 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded uppercase">
                            Standard (ធម្មតា)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold max-w-[185px] truncate">
                          <Heart className="w-3.5 h-3.5 text-rose-455 shrink-0" />
                          <span>{g.emergency || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-start gap-1.5 text-slate-400">
                          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed text-[11px] font-medium">{g.history || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(g)}
                            title="Edit Profile & Rights"
                            className="p-1.5 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-400 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGuestForQr(g);
                              setCopiedPayload(false);
                            }}
                            title="Generate QR Pass Card"
                            className="p-1.5 border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-650 hover:text-white text-indigo-400 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeGuest(g.id, g.name)}
                            title="Remove Profile"
                            className="p-1.5 border border-slate-755 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all shadow-sm cursor-pointer"
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
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {t('noRecords')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RENDER GUEST MANAGEMENT CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {filtered.map(g => {
            const isSelected = selectedIds.includes(g.id);
            return (
              <div 
                key={g.id} 
                className={`bg-slate-800/20 hover:bg-slate-800/40 border p-5 rounded-2xl relative flex flex-col justify-between shadow-sm transition-all duration-200 ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-550/5 shadow-[0_0_20px_rgba(99,102,241,0.08)]' 
                    : 'border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(g.id)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 shrink-0 mr-1 shadow-sm"
                      />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                        {g.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">{g.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1 items-center">
                          <span className="text-[9px] bg-slate-700/60 border border-slate-650 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                            ID: {g.id_passport}
                          </span>
                          {g.tier === 'VIP' ? (
                            <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">
                              👑 VIP ({g.discount}% Off)
                            </span>
                          ) : g.tier === 'Authorized' ? (
                            <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase">
                              🛡️ Auth ({g.discount}% Off)
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-800/80 border border-slate-755 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                              Standard
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(g)}
                        title="Edit Profile & Rights"
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 text-amber-400 hover:text-white rounded-xl transition-all duration-150 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGuestForQr(g);
                          setCopiedPayload(false);
                        }}
                        title="Generate & View check-in QR Code"
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-xl transition-all duration-150 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeGuest(g.id, g.name)}
                        className="p-1.5 border border-slate-755 text-rose-450 hover:bg-rose-500/10 rounded-xl transition-all duration-150 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-slate-700/40 text-xs">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium">{g.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium">{g.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-slate-300 pt-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Emergency contact:</span>
                        <span className="font-semibold text-slate-200">{g.emergency || 'None reported'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loyalty/incident records */}
                <div className="mt-5 pt-3.5 border-t border-slate-700/50 bg-slate-900/40 p-2.5 rounded-xl flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Stay Audit logs</span>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-medium leading-normal">{g.history}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-800/10 border border-slate-700/60 rounded-2xl">
              <p className="text-xs text-slate-400">{t('noRecords')}</p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Slide-Up Bulk Control Actions Panel */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-6 z-40 bg-slate-900/95 border border-indigo-500/30 shadow-[0_10px_45px_rgba(0,0,0,0.55)] backdrop-blur-md p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center bg-indigo-600 text-white font-mono font-bold text-xs w-6 h-6 rounded-full shrink-0 animate-pulse">
              {selectedIds.length}
            </span>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Bulk Actions Active</h5>
              <p className="text-[10px] text-slate-400">
                You have highlighted {selectedIds.length} out of {guests.length} total guest profiles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 w-full md:w-auto justify-end">
            {showBulkDeleteConfirm ? (
              <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 p-1.5 px-3 rounded-xl animate-in zoom-in-95 duration-150 select-none">
                <span className="text-[10px] uppercase font-bold text-rose-400">
                  Confirm bulk delete {selectedIds.length} records?
                </span>
                <button
                  onClick={() => {
                    setGuests(prev => prev.filter(g => !selectedIds.includes(g.id)));
                    setSelectedIds([]);
                    setShowBulkDeleteConfirm(false);
                    triggerToast(`Archived ${selectedIds.length} customer profiles successfully.`);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded transition duration-150"
                >
                  Verify Delete
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded transition border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={exportSelectedGuests}
                  className="flex items-center justify-center gap-1.5 bg-[#1e293b] hover:bg-[#1a2332] border border-slate-750 text-slate-100 font-bold text-[11px] px-3.5 py-2 rounded-xl transition shadow-md shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export Selection (CSV)</span>
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="flex items-center justify-center gap-1.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 hover:text-rose-350 font-bold text-[11px] px-3.5 py-2 rounded-xl transition shadow-md shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-slate-400 hover:text-slate-200 font-bold text-[11px] px-2 py-2 transition"
                >
                  Clear Selection
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Styled Add Guest Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-4">
              {isScanning 
                ? (lang === 'en' ? 'Scanning guest ID card...' : 'កំពុងស្កេនអត្តសញ្ញាណប័ណ្ណ...') 
                : t('registerGuest')}
            </h3>
            
            {isScanning ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Live AI Document OCR Reader
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setIsScanning(false);
                    }}
                    className="p-1 px-1.5 duration-150 transition text-slate-400 hover:text-white rounded bg-slate-700/30 text-xs font-bold"
                  >
                    Cancel Scan
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-black border border-slate-700 shadow-inner">
                  {/* Aspect ratio bounding box for ID card placement */}
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-500/40 rounded-xl m-6 pointer-events-none z-10 flex items-center justify-center">
                    <div className="text-[10px] font-bold text-emerald-400 bg-black/80 px-2 py-1 rounded text-center tracking-wide uppercase">
                      ID CARD / PASSPORT VIEWPORT
                    </div>
                  </div>

                  {/* Laser Scanning Effect */}
                  {ocrState === 'scanning' && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] z-20 animate-pulse pointer-events-none" style={{ top: '40%' }}></div>
                  )}

                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 flex flex-col items-center justify-center bg-slate-950 p-4 text-center space-y-3 relative">
                      {/* Abstract geometric SVG simulating passport scanning */}
                      <div className="w-24 h-16 rounded border border-indigo-500/50 flex flex-col justify-between p-1.5 bg-indigo-500/5 relative overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[8px] font-bold text-indigo-400">ID</div>
                        <div className="w-full h-1 bg-indigo-500/20 rounded"></div>
                        <div className="w-1/2 h-1 bg-indigo-500/20 rounded"></div>
                        <div className="absolute inset-x-0 h-0.5 bg-indigo-400/85 shadow-md animate-bounce top-1/2"></div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-300 block">
                          [Camera Stream Sandboxed]
                        </span>
                        <span className="text-[10px] text-indigo-300 font-medium block">
                          Press "Capture & Extract" to decode pre-loaded traveler dataset.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Scanning State Loader Overlay */}
                  {ocrState === 'extracting' && (
                    <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 select-none">
                      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                      <div className="text-center">
                        <span className="text-xs font-extrabold text-white uppercase block animate-pulse">Running Neural OCR Engine</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">Analyzing machine-readable zones & credentials...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Console logs */}
                <div className="bg-[#090e18] rounded-xl border border-slate-800 p-3 font-mono text-[10px] text-slate-300 space-y-1">
                  <div className="flex gap-2 items-center text-indigo-400 border-b border-slate-900 pb-1.5 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span className="font-bold uppercase tracking-wider text-[9px]">DIAGNOSTIC TELEMETRY</span>
                  </div>
                  <div className="leading-tight text-slate-300 select-none">
                     &gt; {ocrLog}
                  </div>
                  {ocrState === 'scanning' && (
                    <div className="text-slate-500 text-[9px] mt-1.5 italic flex justify-between items-center bg-slate-950/50 p-1.5 rounded">
                      <span>* OCR Profile cycle: #{mockIdIndex + 1} ({sampleOcrProfiles[mockIdIndex].name})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMockIdIndex((mockIdIndex + 1) % sampleOcrProfiles.length);
                        }}
                        className="text-indigo-400 hover:underline not-italic font-bold cursor-pointer"
                      >
                        Next Mock Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive triggers */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setIsScanning(false);
                    }}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-650 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer text-center"
                  >
                    Cancel Scan
                  </button>
                  <button
                    type="button"
                    onClick={triggerOcrScan}
                    disabled={ocrState !== 'scanning'}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Capture & Extract</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsScanning(true);
                    startCamera();
                  }}
                  className="w-full mb-4 py-3 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 hover:text-white cursor-pointer group"
                >
                  <Camera className="w-4 h-4 text-indigo-400 group-hover:scale-110 duration-200 animate-pulse" />
                  <span>Scan ID / Passport via Smart OCR</span>
                  <span className="text-[9px] bg-indigo-550/30 text-indigo-400 font-bold px-1.5 py-0.5 rounded font-mono uppercase">AI Live</span>
                </button>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('guestName')} *</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sok Mean"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">{t('phone')} *</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+855 ..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">{t('idPassport')} *</label>
                      <input 
                        type="text" 
                        value={idPassport}
                        onChange={(e) => setIdPassport(e.target.value)}
                        placeholder="N0..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('email')}</label>
                    <input 
                      type="type" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sok@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('emergencyContact')}</label>
                    <input 
                      type="text" 
                      value={emergency}
                      onChange={(e) => setEmergency(e.target.value)}
                      placeholder="Chhun Ly (+855 99 111 222)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Remarks / Stay History Note</label>
                    <textarea 
                      value={history}
                      onChange={(e) => setHistory(e.target.value)}
                      className="w-full h-14 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold text-slate-400">
                    <div>
                      <label className="block text-[10px] uppercase mb-1">Privilege Rights (សិទ្ធិ)</label>
                      <select 
                        value={tier}
                        onChange={(e) => {
                          const v = e.target.value as 'Standard' | 'VIP' | 'Authorized';
                          setTier(v);
                          if (v === 'VIP') setDiscount(20);
                          else if (v === 'Authorized') setDiscount(15);
                          else setDiscount(0);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value="Standard" className="bg-slate-800">Standard (ធម្មតា)</option>
                        <option value="Authorized" className="bg-slate-800">Authorized (មានសិទ្ធិ)</option>
                        <option value="VIP" className="bg-slate-800">VIP (វីអាយភី)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase mb-1">Privilege Discount (%)</label>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700 flex justify-end gap-2.5">
                    <button 
                      type="button" 
                      onClick={() => {
                        stopCamera();
                        setIsScanning(false);
                        setShowAddModal(false);
                      }}
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
            )}
          </div>
        </div>
      )}

      {/* Dynamic Digital Guest QR Pass Modal */}
      {selectedGuestForQr && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-[#0f172a] border border-indigo-500/35 rounded-3xl max-w-sm w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Background decoration lines */}
            <div className="absolute top-[-100px] right-[-100px] w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Fast-Track Pass</span>
                <h3 className="font-extrabold text-white text-base">Digital Check-In Badge</h3>
              </div>
              <button 
                onClick={() => setSelectedGuestForQr(null)}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Premium Metallic Pass Card */}
            <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] border border-slate-700/60 p-5 rounded-2xl relative text-center space-y-4 shadow-inner">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 px-2 py-0.5 rounded uppercase absolute top-4 right-4">
                VIP Identity
              </span>

              <div className="flex justify-center pt-2">
                <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-700/10 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('GUEST:' + selectedGuestForQr.id)}`} 
                    alt={`Check-in QR code for ${selectedGuestForQr.name}`} 
                    className="w-40 h-40"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-white text-lg tracking-tight">{selectedGuestForQr.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono">PASSPORT: {selectedGuestForQr.id_passport}</p>
              </div>

              {/* Data Table block */}
              <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-left text-[11px] font-mono text-slate-300 space-y-1.5 leading-none">
                <div className="flex justify-between">
                  <span className="text-slate-500">PHONE:</span>
                  <span className="text-white font-semibold">{selectedGuestForQr.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EMAIL:</span>
                  <span className="text-white font-semibold truncate max-w-[150px]">{selectedGuestForQr.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISSUE_REF:</span>
                  <span className="text-indigo-400 font-bold">GUEST_ID#{selectedGuestForQr.id}</span>
                </div>
              </div>
            </div>

            {/* Information Tips */}
            <p className="text-[10px] text-slate-400 text-center mt-3.5 leading-relaxed">
              👉 Project this badge in the Check-In tab QR Scanner tool to expedite room lock allocation.
            </p>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`GUEST:${selectedGuestForQr.id}`);
                  setCopiedPayload(true);
                  triggerToast("QR Payload copied to clipboard!");
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => window.print()}
                className="py-2 px-3.5 bg-indigo-650 hover:bg-[#4f46e5] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile & Rights Modal Dialog */}
      {selectedGuestForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700/60">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400 font-bold" />
                <span>Edit Guest & Rights (សិទ្ធិអតិថិជន)</span>
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedGuestForEdit(null)}
                className="p-1 text-slate-400 hover:text-slate-205 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('guestName')} *</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('phone')} *</label>
                  <input 
                     type="text" 
                     value={editPhone}
                     onChange={(e) => setEditPhone(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                     required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('idPassport')} *</label>
                  <input 
                     type="text" 
                     value={editIdPassport}
                     onChange={(e) => setEditIdPassport(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                     required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('email')}</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('emergencyContact')}</label>
                <input 
                  type="text" 
                  value={editEmergency}
                  onChange={(e) => setEditEmergency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
               </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Remarks / Stay History Note</label>
                <textarea 
                  value={editHistory}
                  onChange={(e) => setEditHistory(e.target.value)}
                  className="w-full h-14 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none resize-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Privilege Rights (សិទ្ធិ)</label>
                  <select 
                    value={editTier}
                    onChange={(e) => {
                      const v = e.target.value as 'Standard' | 'VIP' | 'Authorized';
                      setEditTier(v);
                      if (v === 'VIP') setEditDiscount(20);
                      else if (v === 'Authorized') setEditDiscount(15);
                      else setEditDiscount(0);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Standard" className="bg-slate-800">Standard (ធម្មតា)</option>
                    <option value="Authorized" className="bg-slate-800">Authorized (មានសិទ្ធិ)</option>
                    <option value="VIP" className="bg-slate-800">VIP (វីអាយភី)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Privilege Discount (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setSelectedGuestForEdit(null)}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 rounded-lg text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-450 rounded-lg text-xs font-semibold text-slate-950 cursor-pointer"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
