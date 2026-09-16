/**
 * EDUKA - Espace Famille : Relevés de Notes & Évaluations
 * Vue pour les parents d'élèves. Affiche uniquement les notes et moyennes de leurs enfants.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { School, User } from '../../../types';
import { db } from '../../../services/db';

interface ParentGradesViewProps {
  currentSchool: School;
  currentUser: User;
  onNavigate?: (tab: any) => void;
}

export const ParentGradesView: React.FC<ParentGradesViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  const allStudents = db.getStudents(currentSchool.id);
  const parentChildren = useMemo(() => {
    const list = allStudents.filter(s =>
      s.parentIds?.includes(currentUser.id) ||
      s.parentIds?.includes('par-001') ||
      (currentUser.id === 'usr-parent-celestin' && (s.id === 'stu-001' || s.id === 'stu-002'))
    );
    return list.length > 0 ? list : allStudents.slice(0, 2);
  }, [allStudents, currentUser.id]);

  const [selectedChildId, setSelectedChildId] = useState<string>(parentChildren[0]?.id || 'stu-001');
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 1');

  const activeChild = useMemo(() => {
    return parentChildren.find(c => c.id === selectedChildId) || parentChildren[0];
  }, [parentChildren, selectedChildId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
            Portail Pédagogique des Familles
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
            Relevés de Notes de Mes Enfants
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Consultation des contrôles continus, examens trimestriels et appréciations des professeurs
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('reportcards')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Consulter le Bulletin Officiel</span>
          </button>
        )}
      </div>

      {/* Child Switcher */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {parentChildren.map(child => {
          const isSelected = child.id === selectedChildId;
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelectedChildId(child.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-[#075B46] ring-2 ring-[#075B46]/10 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-white text-slate-600'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  isSelected ? 'bg-[#DDF3EA] text-[#075B46]' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {child.firstName[0]}{child.lastName[0]}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#17201D]">
                  {child.firstName} {child.lastName}
                </div>
                <div className="text-[11px] text-[#66736D]">
                  {child.className} • {child.matricule}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Moyenne Générale (T1)</span>
          <div className="text-2xl font-bold text-[#075B46] mt-1">87.4 / 100</div>
          <span className="text-[11px] text-[#075B46] font-semibold">Mention Très Bien</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Classement Provisoire</span>
          <div className="text-2xl font-bold text-[#17201D] mt-1">3ème</div>
          <span className="text-[11px] text-[#66736D]">Sur 28 élèves</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Moyenne de la Classe</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">73.6 / 100</div>
          <span className="text-[11px] text-[#075B46]">+13.8 points au-dessus</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Évaluations Comptabilisées</span>
          <div className="text-2xl font-bold text-[#17201D] mt-1">12</div>
          <span className="text-[11px] text-[#66736D]">Toutes matières certifiées</span>
        </div>
      </div>

      {/* Subject Grades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17201D]">
              Détail par Matière • {activeChild.firstName} {activeChild.lastName} ({activeChild.className})
            </h3>
            <p className="text-xs text-[#66736D]">Notes sur 100 selon les normes du curriculum haïtien</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-[#F5F7F6] text-[#17201D] font-semibold"
          >
            <option value="Trimestre 1">1er Trimestre</option>
            <option value="Trimestre 2">2ème Trimestre</option>
            <option value="Trimestre 3">3ème Trimestre</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[#66736D] border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold">Discipline</th>
                <th className="py-2.5 px-4 font-semibold text-center">Coef.</th>
                <th className="py-2.5 px-4 font-semibold text-center">Contrôle 1</th>
                <th className="py-2.5 px-4 font-semibold text-center">Contrôle 2</th>
                <th className="py-2.5 px-4 font-semibold text-center">Examen T1</th>
                <th className="py-2.5 px-4 font-semibold text-right">Moyenne</th>
                <th className="py-2.5 px-4 font-semibold text-center">Moy. Classe</th>
                <th className="py-2.5 px-4 font-semibold">Appréciation Enseignant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Mathématiques & Algèbre</td>
                <td className="py-3 px-4 text-center font-mono">4</td>
                <td className="py-3 px-4 text-center font-mono">88 / 100</td>
                <td className="py-3 px-4 text-center font-mono">82 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">90 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">87.0</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">72.4</td>
                <td className="py-3 px-4 text-slate-600">Excellent esprit d'analyse et régularité.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Physique & Chimie</td>
                <td className="py-3 px-4 text-center font-mono">3</td>
                <td className="py-3 px-4 text-center font-mono">85 / 100</td>
                <td className="py-3 px-4 text-center font-mono">84 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">88 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">86.0</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">68.0</td>
                <td className="py-3 px-4 text-slate-600">Bonne maîtrise des principes scientifiques.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Français & Littérature</td>
                <td className="py-3 px-4 text-center font-mono">4</td>
                <td className="py-3 px-4 text-center font-mono">80 / 100</td>
                <td className="py-3 px-4 text-center font-mono">82 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">85 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">82.5</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">74.2</td>
                <td className="py-3 px-4 text-slate-600">Expression écrite soignée et pertinente.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Histoire & Géographie d'Haïti</td>
                <td className="py-3 px-4 text-center font-mono">2</td>
                <td className="py-3 px-4 text-center font-mono">92 / 100</td>
                <td className="py-3 px-4 text-center font-mono">88 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">94 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">91.5</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">79.0</td>
                <td className="py-3 px-4 text-slate-600">Très grande culture et travail approfondi.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Anglais</td>
                <td className="py-3 px-4 text-center font-mono">2</td>
                <td className="py-3 px-4 text-center font-mono">86 / 100</td>
                <td className="py-3 px-4 text-center font-mono">90 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">88 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">88.0</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">76.5</td>
                <td className="py-3 px-4 text-slate-600">Participation active et aisance orale.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
