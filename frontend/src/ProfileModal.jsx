import React, { useState } from 'react';
import API from './api';
import { X, User, Target, Check, Loader2 } from 'lucide-react';

const EXAM_OPTIONS = [
  'SSC CGL',
  'SSC CHSL',
  'RRB NTPC',
  'RRB Group D',
  'IBPS PO / Clerk',
  'SBI PO'
];

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  if (!isOpen) return null;

  const [name, setName] = useState(user?.name || '');
  const [targetExam, setTargetExam] = useState(user?.targetExam || 'SSC CGL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const res = await API.put('/auth/profile', { name, targetExam });
      if (res.data?.success) {
        onUpdateUser(res.data.user);
        // Also update cached user if stored
        const existing = localStorage.getItem('shiksha_user');
        if (existing) {
          const parsed = JSON.parse(existing);
          localStorage.setItem('shiksha_user', JSON.stringify({ ...parsed, name, targetExam }));
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <User className="w-4 h-4" />
            <span>Profile & Exam Preference</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Target Exam Focus
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXAM_OPTIONS.map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => setTargetExam(exam)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition cursor-pointer ${
                    targetExam === exam
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{exam}</span>
                  {targetExam === exam && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}