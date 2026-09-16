/**
 * EDUKA - Espace Élève : Mon Relevé de Notes
 * Vue pour l'élève connecté.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  FileText,
  Printer,
  TrendingUp,
  Clock
} from 'lucide-react';
import { School, User } from '../../../types';

interface StudentGradesViewProps {
  currentSchool: School;
  currentUser: User;
  onNavigate?: (tab: any) => void;
}

export const StudentGradesView: React.FC<StudentGradesViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 1');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
            Espace Apprenant
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
            Mon Relevé de Notes & Moyennes
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Classe : <strong>NS1-A</strong> • Matricule : <strong className="font-mono text-[#075B46]">{currentUser.matricule}</strong>
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('reportcards')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Consulter mon Bulletin</span>
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Ma Moyenne T1</span>
          <div className="text-2xl font-bold text-[#075B46] mt-1">87.4 / 100</div>
          <span className="text-[11px] text-emerald-700">Mention Très Bien</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Rang dans la Classe</span>
          <div className="text-2xl font-bold text-[#17201D] mt-1">3ème</div>
          <span className="text-[11px] text-[#66736D]">Sur 28 élèves</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Moyenne de la Classe</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">73.6 / 100</div>
          <span className="text-[11px] text-slate-500">Moyenne générale</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-[#66736D]">Total Coefficients</span>
          <div className="text-2xl font-bold text-[#17201D] mt-1">15</div>
          <span className="text-[11px] text-[#66736D]">5 matières certifiées</span>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#17201D]">
            Détail des Matières Évaluées ({selectedPeriod})
          </h3>
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
                <th className="py-2.5 px-4 font-semibold">Matière</th>
                <th className="py-2.5 px-4 font-semibold text-center">Coef.</th>
                <th className="py-2.5 px-4 font-semibold text-center">Contrôle 1</th>
                <th className="py-2.5 px-4 font-semibold text-center">Contrôle 2</th>
                <th className="py-2.5 px-4 font-semibold text-center">Examen T1</th>
                <th className="py-2.5 px-4 font-semibold text-right">Ma Moyenne</th>
                <th className="py-2.5 px-4 font-semibold text-center">Moy. Classe</th>
                <th className="py-2.5 px-4 font-semibold">Appréciation</th>
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
                <td className="py-3 px-4 text-slate-600">Excellent esprit d'analyse.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Physique & Chimie</td>
                <td className="py-3 px-4 text-center font-mono">3</td>
                <td className="py-3 px-4 text-center font-mono">85 / 100</td>
                <td className="py-3 px-4 text-center font-mono">84 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">88 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">86.0</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">68.0</td>
                <td className="py-3 px-4 text-slate-600">Bonne rigueur scientifique.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Français & Littérature</td>
                <td className="py-3 px-4 text-center font-mono">4</td>
                <td className="py-3 px-4 text-center font-mono">80 / 100</td>
                <td className="py-3 px-4 text-center font-mono">82 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">85 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">82.5</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">74.2</td>
                <td className="py-3 px-4 text-slate-600">Expression claire et soignée.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Histoire & Géographie d'Haïti</td>
                <td className="py-3 px-4 text-center font-mono">2</td>
                <td className="py-3 px-4 text-center font-mono">92 / 100</td>
                <td className="py-3 px-4 text-center font-mono">88 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">94 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">91.5</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">79.0</td>
                <td className="py-3 px-4 text-slate-600">Très bon travail d'assimilation.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17201D]">Anglais</td>
                <td className="py-3 px-4 text-center font-mono">2</td>
                <td className="py-3 px-4 text-center font-mono">86 / 100</td>
                <td className="py-3 px-4 text-center font-mono">90 / 100</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-[#075B46]">88 / 100</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#075B46]">88.0</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono">76.5</td>
                <td className="py-3 px-4 text-slate-600">Bonne participation en classe.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
