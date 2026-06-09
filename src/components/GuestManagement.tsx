import React, { useState } from 'react';
import { Guest } from '../types';
import { UserPlus, Search, Phone, Mail, FileText, Trash2, Heart } from 'lucide-react';

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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white uppercase text-sm">
                    {g.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-tight">{g.name}</h4>
                    <span className="text-[10px] bg-slate-700 border border-slate-650 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                      ID: {g.id_passport}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeGuest(g.id, g.name)}
                  className="p-1 px-2 text-xs border border-slate-750 text-rose-450 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
    </div>
  );
}
