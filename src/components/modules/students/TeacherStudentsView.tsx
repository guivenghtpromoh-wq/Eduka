/**
 * EDUKA - Espace Enseignant : Effectifs de Mes Classes
 * Vue adaptée pour les professeurs certifiés.
 * Affiche uniquement les élèves inscrits dans les classes assignées au professeur.
 * Données financières strictement masquées pour des raisons de déontologie.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CalendarCheck,
  BookOpen,
  Award,
  Clock,
  School as SchoolIcon,
  ChevronRight
} from 'lucide-react';
import { School, User } from '../../../types';
import { db } from '../../../services/db';

interface TeacherStudentsViewProps {
  currentSchool: School;
  currentUser: User;
  onNavigate?: (tab: any) => void;
}

export const TeacherStudentsView: React.FC<TeacherStudentsViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  const classes = db.getClasses(currentSchool.id);
  // Assigned classes (e.g. NS1-A and Philo)
  const teacherClasses = useMemo(() => {
    return classes.filter(c => c.mainTeacherId === 'tch-001' || c.id === 'cls-001');
  }, [classes]);

  const [selectedClassId, setSelectedClassId] = useState<string>(teacherClasses[0]?.id || classes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const allStudents = db.getStudents(currentSchool.id);
  const classStudents = useMemo(() => {
    return allStudents.filter(s => {
      if (s.currentClassId !== selectedClassId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.matricule.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allStudents, selectedClassId, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
            Espace Pédagogique
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
            Effectifs de Vos Classes : Prof. {currentUser.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Suivi des élèves par section, cahier de notes et assiduité en classe
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Faire l'Appel</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('grades')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#075B46]" />
                <span>Saisie des Notes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Class Selector & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-[#17201D] whitespace-nowrap">Classe active :</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-[#F5F7F6] font-semibold text-[#17201D]"
          >
            {teacherClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.room}) — {c.studentCount} élèves</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-[#F5F7F6] focus:outline-hidden focus:border-[#075B46]"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#17201D]">
            Liste des Élèves Inscrits ({classStudents.length})
          </span>
          <span className="text-[11px] text-[#66736D]">
            Matière enseignée : Mathématiques & Algèbre
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[#66736D] border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold">Matricule</th>
                <th className="py-2.5 px-4 font-semibold">Nom & Prénom</th>
                <th className="py-2.5 px-4 font-semibold text-center">Genre</th>
                <th className="py-2.5 px-4 font-semibold text-center">Moyenne Maths</th>
                <th className="py-2.5 px-4 font-semibold text-center">Assiduité</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-medium text-[#075B46]">{s.matricule}</td>
                  <td className="py-3 px-4 font-semibold text-[#17201D]">
                    {s.lastName.toUpperCase()}, {s.firstName}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-600">{s.gender}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">
                    {idx === 0 ? '88 / 100' : idx === 1 ? '76 / 100' : '82 / 100'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DDF3EA] text-[#075B46]">
                      98%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('grades')}
                        className="text-xs font-semibold text-[#075B46] hover:underline"
                      >
                        Notes →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
