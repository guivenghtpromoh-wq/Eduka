/**
 * EDUKA - Share Academic Note / Homework Modal
 * Enables students and teachers to share formatted notes,
 * study summaries, and exercise solutions within chat rooms.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import { X, BookOpen, Send, FileText, Check } from 'lucide-react';
import { ChatNoteData } from '../../../types';

interface ShareNoteModalProps {
  onShare: (note: ChatNoteData) => void;
  onClose: () => void;
}

const SUBJECT_OPTIONS = [
  'Mathématiques & Algèbre',
  'Sciences Physiques & Chimie',
  'Sciences de la Vie et de la Terre (SVT)',
  'Français & Littérature',
  'Créole & Culture Haïtienne',
  'Histoire & Géographie d\'Haïti',
  'Philosophie',
  'Anglais',
  'Espagnol',
  'Informatique & Technologie'
];

export const ShareNoteModal: React.FC<ShareNoteModalProps> = ({ onShare, onClose }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    onShare({
      title: title.trim(),
      subject,
      text: text.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#075B46] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pataje yon Nòt oswa Devoir</h3>
              <p className="text-xs text-slate-500">Pataje fich revizyon ak solisyon ak kamarad klas ou yo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tit Nòt la / Sijè Devoir a *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Fich Rezime : Fonksyon ak Polynômes (Chapit 2)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Matyè Konsène *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] bg-white"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kontni Nòt la / Rezime / Fòmil kle *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Ekri nòt, definisyon, fòmil oswa etap pou rezoud egzèsis yo isit la..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] focus:border-transparent font-sans"
            />
          </div>

          {/* Quick preview card */}
          {title && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#075B46]" />
                <span className="text-[11px] font-semibold text-[#075B46]">{subject}</span>
              </div>
              <p className="text-xs font-medium text-slate-800 line-clamp-1">{title}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Anile
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !text.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#064e3b] disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Voye Nòt la</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
