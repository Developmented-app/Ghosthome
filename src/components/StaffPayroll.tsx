import React, { useState } from 'react';
import { Staff } from '../types';
import { Users2, Plus, Calendar, CreditCard, Search, CheckCircle, UserCheck, Trash2 } from 'lucide-react';

interface StaffPayrollProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function StaffPayroll({ staff, setStaff, lang, t, triggerToast }: StaffPayrollProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add staff states
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Receptionist');
  const [salary, setSalary] = useState(350);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !salary || salary <= 0) {
      triggerToast(t('validationError'));
      return;
    }

    const created: Staff = {
      id: staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1,
      name: name.trim(),
      position,
      salary,
      attendance: 'Present',
      payroll: 'Pending'
    };

    setStaff([...staff, created]);
    setShowAddModal(false);
    triggerToast(`Staff profile for "${created.name}" registered successfully.`);

    // Reset states
    setName('');
    setPosition('Receptionist');
    setSalary(350);
  };

  const removeStaff = (id: number, sName: string) => {
    setStaff(staff.filter(s => s.id !== id));
    triggerToast(`Archived staff profile: ${sName}`);
  };

  const toggleAttendanceStatus = (id: number, current: Staff['attendance']) => {
    const statuses: Staff['attendance'][] = ['Present', 'Absent', 'On Leave'];
    const nextIndex = (statuses.indexOf(current) + 1) % statuses.length;
    const nextValue = statuses[nextIndex];

    setStaff(staff.map(s => {
      if (s.id === id) {
        triggerToast(`Updated attendance for ${s.name} to ${nextValue}`);
        return { ...s, attendance: nextValue };
      }
      return s;
    }));
  };

  const togglePayrollStatus = (id: number, current: Staff['payroll']) => {
    const nextValue: Staff['payroll'] = current === 'Paid' ? 'Pending' : 'Paid';
    setStaff(staff.map(s => {
      if (s.id === id) {
        triggerToast(`Payroll for ${s.name} set to ${nextValue}`);
        return { ...s, payroll: nextValue };
      }
      return s;
    }));
  };

  const totalMonthlyPayrollCost = staff.reduce((sum, s) => sum + s.salary, 0);
  const paidPayrollCost = staff.filter(s => s.payroll === 'Paid').reduce((sum, s) => sum + s.salary, 0);

  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.position.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Upper header action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('staffPayroll')}</h2>
          <p className="text-xs text-slate-400">View staff positions, record daily attendances, and execute monthly base salary disbursements.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Mini cost analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Accumulated Monthly Payroll Liability</span>
            <h4 className="text-lg font-bold text-slate-200 mt-1">${totalMonthlyPayrollCost.toFixed(2)}</h4>
          </div>
          <Users2 className="w-8 h-8 text-indigo-400/20" />
        </div>

        <div className="bg-slate-800/40 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Reconciled / Settled Payouts</span>
            <h4 className="text-lg font-bold text-emerald-400 mt-1">${paidPayrollCost.toFixed(2)} / ${totalMonthlyPayrollCost.toFixed(2)}</h4>
          </div>
          <CreditCard className="w-8 h-8 text-emerald-400/25" />
        </div>
      </div>

      <div className="bg-slate-800/20 border border-slate-700/60 rounded-2xl overflow-hidden shadow-md">
        {/* Table Search bar */}
        <div className="p-4 border-b border-slate-700/60 bg-slate-900/20 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-350">Human Resource Registers</span>
          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Find employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-755 rounded-lg pl-8 p-1.5 text-xs outline-none focus:border-indigo-500 transition text-white"
            />
          </div>
        </div>

        {/* Directory Listing table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                <th className="py-3.5 px-4">{t('staffName')}</th>
                <th className="py-3.5 px-4">{t('position')}</th>
                <th className="py-3.5 px-4">{t('salary')}</th>
                <th className="py-3.5 px-4">{t('attendance')}</th>
                <th className="py-3.5 px-4">{t('payrollStatus')}</th>
                <th className="py-3.5 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 font-sans">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/10 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{emp.name}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">{emp.position}</td>
                  <td className="py-3.5 px-4 font-bold font-mono text-slate-205">${emp.salary}/month</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleAttendanceStatus(emp.id, emp.attendance)}
                      title="Click to toggle"
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                        emp.attendance === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        emp.attendance === 'Absent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{emp.attendance}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => togglePayrollStatus(emp.id, emp.payroll)}
                      title="Click to toggle"
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                        emp.payroll === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-450 animate-pulse'
                      }`}
                    >
                      {emp.payroll === 'Paid' ? t('paid') : t('unpaid')}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => removeStaff(emp.id, emp.name)}
                      className="p-1 px-2 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {t('noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-md px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-4">Add Staff Profile</h3>
            
            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('staffName')} *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sreyroth Mom"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t('position')}</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Receptionist">Receptionist</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Security & Maintenance">Security & Maintenance</option>
                  <option value="Housekeeping cleaner">Housekeeping cleaner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Wage ($) *</label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  required
                />
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
