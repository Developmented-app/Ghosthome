import React, { useState } from 'react';
import { CrmNote } from '../types';
import { MessagesSquare, Plus, Search, MessageSquareCode, CheckCircle, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface CrmNotepadProps {
  crmNotes: CrmNote[];
  setCrmNotes: React.Dispatch<React.SetStateAction<CrmNote[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function CrmNotepad({ crmNotes, setCrmNotes, lang, t, triggerToast }: CrmNotepadProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [noteType, setNoteType] = useState<'Note' | 'Complaint' | 'Request'>('Note');
  const [message, setMessage] = useState('');

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) {
      triggerToast(t('validationError'));
      return;
    }

    const created: CrmNote = {
      id: crmNotes.length > 0 ? Math.max(...crmNotes.map(n => n.id)) + 1 : 1,
      name: guestName.trim(),
      type: noteType,
      message: message.trim(),
      status: 'Pending'
    };

    setCrmNotes([created, ...crmNotes]);
    setShowAddModal(false);
    triggerToast(`Customer Note logged for guest: "${created.name}"`);

    // Reset forms
    setGuestName('');
    setNoteType('Note');
    setMessage('');
  };

  const removeNote = (id: number) => {
    setCrmNotes(crmNotes.filter(n => n.id !== id));
    triggerToast("Feedback record deleted.");
  };

  const toggleResolutionStatus = (id: number, current: CrmNote['status']) => {
    const statuses: CrmNote['status'][] = ['Pending', 'In Progress', 'Resolved'];
    const nextIndex = (statuses.indexOf(current || 'Pending') + 1) % statuses.length;
    const nextValue = statuses[nextIndex];

    setCrmNotes(crmNotes.map(n => {
      if (n.id === id) {
        triggerToast(`Ticket status for ${n.name} changed to ${nextValue}`);
        return { ...n, status: nextValue };
      }
      return n;
    }));
  };

  const filtered = crmNotes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Upper header action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('crm')}</h2>
          <p className="text-xs text-slate-400">File specific guest incident reports, resolve active service requests, and record special preferences.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>File Incident/Request</span>
        </button>
      </div>

      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 max-w-sm">
        <div className="relative">
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

      {/* Grid rendering cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(note => (
          <div key={note.id} className="bg-slate-800/20 border border-slate-705/60 p-5 rounded-2xl relative flex flex-col justify-between shadow-sm hover:bg-slate-800/35 transition">
            
            <div>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    note.type === 'Complaint' ? 'bg-rose-500' :
                    note.type === 'Request' ? 'bg-amber-500' : 'bg-indigo-400'
                  }`}></span>
                  <span className="font-bold text-white text-xs uppercase tracking-wider">{note.type} Ticket</span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-450 font-mono">ID: CRM-{note.id}03</span>
                  <button 
                    onClick={() => removeNote(note.id)}
                    className="p-1 px-1.5 border border-slate-750 text-slate-400 hover:text-rose-400 transition rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-indigo-350 block font-bold mb-1">Guest: {note.name}</span>
                <p className="text-xs text-slate-250 font-medium leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-750/30">
                  "{note.message}"
                </p>
              </div>
            </div>

            {/* Resolution flow triggers */}
            <div className="mt-5 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs">
              <span className="text-slate-450">Resolving status:</span>
              <button
                onClick={() => toggleResolutionStatus(note.id, note.status)}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition ${
                  note.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  note.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                  'bg-rose-500/15 text-rose-450 animate-pulse'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{note.status || 'Pending'}</span>
              </button>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-800/10 border border-slate-700/60 rounded-2xl">
            <p className="text-xs text-slate-450">{t('noRecords')}</p>
          </div>
        )}
      </div>

      {/* Styled Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-4">File CRM Entry</h3>
            
            <form onSubmit={handleAddNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('guestName')} *</label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Sok Mean"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Feedback Class</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Note">General Preference / Note</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Request">Immediate Service Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Content description *</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Prefers high floor rooms far from elevators..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none focus:border-indigo-500"
                  required
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
