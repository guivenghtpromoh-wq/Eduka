/**
 * EDUKA - Deterministic Global Search Modal
 * Searches across students, staff, classes, documents, and invoices.
 * Respects strict granular RBAC permissions.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  GraduationCap,
  School as SchoolIcon,
  FileText,
  DollarSign,
  X,
  ArrowRight
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { ActiveTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) {
      return { students: [], teachers: [], classes: [], documents: [], invoices: [] };
    }

    const q = query.toLowerCase().trim();
    const canReadStudents = auth.hasPermission('students.read');
    const canReadTeachers = auth.hasPermission('teachers.read');
    const canReadClasses = auth.hasPermission('classes.read');
    const canReadDocs = auth.hasPermission('documents.read');
    const canReadFinance = auth.hasPermission('finance.read');

    const students = canReadStudents
      ? db.getStudents().filter(
          s =>
            s.firstName.toLowerCase().includes(q) ||
            s.lastName.toLowerCase().includes(q) ||
            s.matricule.toLowerCase().includes(q)
        ).slice(0, 4)
      : [];

    const teachers = canReadTeachers
      ? db.getTeachers().filter(
          t =>
            t.firstName.toLowerCase().includes(q) ||
            t.lastName.toLowerCase().includes(q) ||
            t.specialty.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    const classes = canReadClasses
      ? db.getClasses().filter(
          c =>
            c.name.toLowerCase().includes(q) ||
            c.level.toLowerCase().includes(q) ||
            c.room.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    const documents = canReadDocs
      ? db.getDocuments().filter(d => d.title.toLowerCase().includes(q)).slice(0, 3)
      : [];

    const invoices = canReadFinance
      ? db.getInvoices().filter(
          i =>
            i.invoiceNumber.toLowerCase().includes(q) ||
            i.studentName.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    return { students, teachers, classes, documents, invoices };
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.students.length +
    results.teachers.length +
    results.classes.length +
    results.documents.length +
    results.invoices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-[#075B46] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher par nom d'élève, matricule, classe, facture..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm text-[#17201D] placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded"
          >
            Échap
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim().length >= 2 && totalResults === 0 && (
            <div className="text-center py-8 text-sm text-[#66736D]">
              Aucun enregistrement correspondant à « {query} ».
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Saisissez au moins 2 caractères pour lancer la recherche institutionnelle.
            </div>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#075B46] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Élèves ({results.students.length})</span>
              </div>
              <div className="space-y-1">
                {results.students.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onNavigate('students', s.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F7F6] text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#17201D]">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-[10px] text-[#66736D]">
                        Matricule : {s.matricule} • {s.className}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#075B46] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Classes */}
          {results.classes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#075B46] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <SchoolIcon className="w-3.5 h-3.5" />
                <span>Classes & Salles ({results.classes.length})</span>
              </div>
              <div className="space-y-1">
                {results.classes.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onNavigate('classes', c.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F7F6] text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#17201D]">{c.name}</div>
                      <div className="text-[10px] text-[#66736D]">{c.room} • Titulaire : {c.mainTeacherName}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#075B46] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teachers */}
          {results.teachers.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#075B46] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Corps Enseignant ({results.teachers.length})</span>
              </div>
              <div className="space-y-1">
                {results.teachers.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onNavigate('teachers', t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F7F6] text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#17201D]">
                        Prof. {t.firstName} {t.lastName}
                      </div>
                      <div className="text-[10px] text-[#66736D]">{t.specialty} • {t.email}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#075B46] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#075B46] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Factures & Écolages ({results.invoices.length})</span>
              </div>
              <div className="space-y-1">
                {results.invoices.map(inv => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      onNavigate('finance', inv.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F7F6] text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#17201D]">
                        {inv.invoiceNumber} — {inv.studentName}
                      </div>
                      <div className="text-[10px] text-[#66736D]">
                        Reste dû : {inv.balanceRemaining} {inv.currency} • Échéance : {inv.dueDate}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#075B46] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F7F6] px-4 py-2 text-[11px] text-[#66736D] flex justify-between border-t border-slate-200">
          <span>Recherche filtrée selon vos permissions de rôle</span>
          <span>EDUKA Engine</span>
        </div>

      </div>
    </div>
  );
};
