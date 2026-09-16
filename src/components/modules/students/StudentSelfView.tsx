/**
 * EDUKA - Espace Élève : Mon Profil & Carte Scolaire
 * Vue personnalisée strictement réservée à l'élève connecté.
 * Affiche son dossier personnel, sa carte scolaire numérique MENFP avec QR code,
 * et ses matières inscrites.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  QrCode,
  Printer,
  Calendar,
  BookOpen,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Download,
  UserCheck
} from 'lucide-react';
import { School, User } from '../../../types';
import { db } from '../../../services/db';

interface StudentSelfViewProps {
  currentSchool: School;
  currentUser: User;
  onNavigate?: (tab: any) => void;
}

export const StudentSelfView: React.FC<StudentSelfViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  const subjects = db.getSubjects(currentSchool.id);
  const [activeTab, setActiveTab] = useState<'carte' | 'matieres' | 'documents'>('carte');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
            Portail de l'Apprenant
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
            Mon Dossier & Carte Scolaire : {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Matricule National : <strong className="font-mono text-[#17201D]">{currentUser.matricule}</strong> • Nouveau Secondaire 1 (NS1-A)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('grades')}
                className="px-3.5 py-2 text-xs font-semibold text-[#075B46] bg-[#DDF3EA] hover:bg-[#cbeee1] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mes Notes</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('reportcards')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Award className="w-4 h-4" />
                <span>Mon Bulletin</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('carte')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'carte'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Carte Scolaire Numérique
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matieres')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'matieres'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Mes Matières & Professeurs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Documents Officiels
        </button>
      </div>

      {/* Tab: Digital School ID Card */}
      {activeTab === 'carte' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Official Badge Card */}
          <div className="bg-gradient-to-br from-[#075B46] to-[#043629] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden border border-emerald-900">
            {/* Background seal pattern */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border-8 border-white/5 pointer-events-none" />
            <div className="absolute right-12 top-6 opacity-10">
              <GraduationCap className="w-28 h-28 text-white" />
            </div>

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-5">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-emerald-200 font-semibold">
                  RÉPUBLIQUE D'HAÏTI • MENFP
                </div>
                <div className="text-sm font-bold mt-0.5 tracking-wide uppercase">
                  {currentSchool.name}
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-white/15 backdrop-blur-xs rounded-md uppercase border border-white/20">
                2024-2025
              </span>
            </div>

            {/* Card Body */}
            <div className="flex items-center space-x-5">
              <div className="w-24 h-28 rounded-xl bg-white/10 border-2 border-white/30 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl mb-1">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-semibold">Élève Régulier</span>
              </div>

              <div className="space-y-1.5 flex-1">
                <div>
                  <span className="text-[10px] text-emerald-300 uppercase tracking-wider">Nom & Prénom</span>
                  <div className="text-base font-bold text-white tracking-wide">
                    {currentUser.lastName.toUpperCase()}, {currentUser.firstName}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-300">Classe</span>
                    <div className="font-semibold">NS1-A</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300">Matricule</span>
                    <div className="font-mono font-bold text-emerald-200">{currentUser.matricule}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white rounded-md">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
                <div className="text-[10px] text-emerald-200 leading-tight">
                  <div>Identifiant Officiel Sécurisé</div>
                  <div className="font-mono text-[9px] text-white/70">VERIF-{currentUser.matricule}</div>
                </div>
              </div>
              <div className="text-right text-[10px] text-emerald-300">
                <div>Statut : Inscrit & Validé</div>
                <div className="text-white font-medium">Direction Pédagogique</div>
              </div>
            </div>
          </div>

          {/* Card actions & info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#17201D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#075B46]" />
              Validité de la Carte Scolaire
            </h3>
            <p className="text-xs text-[#66736D] leading-relaxed">
              Cette carte d'identité scolaire certifie votre statut d'élève régulier au sein de l'établissement <strong>{currentSchool.name}</strong> pour l'année académique en cours. Elle donne accès aux salles d'examen, à la bibliothèque et aux activités parascolaires.
            </p>

            <div className="p-3 bg-[#F5F7F6] rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date d'émission :</span>
                <span className="font-semibold text-slate-800">1er Septembre 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date d'expiration :</span>
                <span className="font-semibold text-slate-800">30 Juin 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Autorité de délivrance :</span>
                <span className="font-semibold text-[#075B46]">Direction de l'Établissement</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 bg-[#075B46] hover:bg-[#0B8064] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer ma Carte Scolaire</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Matieres */}
      {activeTab === 'matieres' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#17201D]">Matières au Programme (Nouveau Secondaire 1)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map(s => (
              <div key={s.id} className="p-3.5 rounded-lg border border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#17201D]">{s.name}</div>
                  <div className="text-xs text-[#66736D] mt-0.5">Code : {s.code} • Salle 201</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-xs font-bold bg-[#DDF3EA] text-[#075B46] rounded-md font-mono">
                    Coef. {s.coefficient}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#17201D]">Documents Académiques Disponibles</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#17201D]">Attestation d'Inscription Officielle (2024-2025)</span>
                <div className="text-slate-500 mt-0.5">Format PDF certifié avec sceau MENFP</div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#F5F7F6] hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#17201D]">Relevé des Notes du 1er Trimestre</span>
                <div className="text-slate-500 mt-0.5">Moyenne : 87.4 / 100 • Mention Très Bien</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('reportcards')}
                className="px-3 py-1.5 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-md font-semibold flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Voir le Bulletin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
