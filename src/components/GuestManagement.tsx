import React, { useState } from 'react';
import { Guest } from '../types';
import { UserPlus, Search, Phone, Mail, FileText, Trash2, Heart, QrCode, Printer, Copy, Check, X } from 'lucide-react';

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

  // Form States for Guest
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idPassport, setIdPassport] = useState('');
  const [email, setEmail] = useState('');
  const [emergency, setEmergency] = useState('');
  const [history, setHistory] = useState('New Profile registered.');

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
      history: history.trim()
    };

    setGuests([...guests, created]);
    setShowAddModal(false);
    triggerToast(`Guest ${created.name} registered successfully.`);

    // Reset Form
    setName('');
    setPhone('');
    setIdPassport('');
    setEmail('');
    setEmergency('');
    setHistory('New Profile registered.');
  };

  const removeGuest = (id: number, gName: string) => {
    setGuests(guests.filter(g => g.id !== id));
    triggerToast(`Removed profile for ${gName}.`);
  };

  const filtered = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.phone.includes(search) || 
    g.id_passport.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search Filter */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
        <div className="relative max-w-sm">
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

      {/* Guest Cards Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(g => (
          <div key={g.id} className="bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                    {g.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-tight">{g.name}</h4>
                    <span className="text-[10px] bg-slate-700/60 border border-slate-650 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                      ID: {g.id_passport}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedGuestForQr(g);
                      setCopiedPayload(false);
                    }}
                    title="Generate & View check-in QR Code"
                    className="p-1.5 bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-xl transition-all duration-150"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeGuest(g.id, g.name)}
                    className="p-1.5 border border-slate-755 text-rose-450 hover:bg-rose-500/10 rounded-xl transition-all duration-150"
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
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-800/10 border border-slate-700/60 rounded-2xl">
            <p className="text-xs text-slate-400">{t('noRecords')}</p>
          </div>
        )}
      </div>

      {/* Styled Add Guest Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-4">{t('registerGuest')}</h3>
            
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
                  type="email" 
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
                  className="w-full h-16 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none focus:border-indigo-500"
                ></textarea>
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
    </div>
  );
}
