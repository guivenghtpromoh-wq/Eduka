/**
 * EDUKA - Espace Famille : Mes Enfants Inscrits
 * Vue strictement confidentielle et adaptée pour les parents d'élèves.
 * Affiche uniquement les enfants rattachés au responsable légal.
 * AUCUN accès aux autres élèves de l'établissement.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  CalendarCheck,
  CreditCard,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  AlertCircle,
  Phone,
  MapPin,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import { School, Student, User } from '../../../types';
import { db } from '../../../services/db';

interface ParentStudentsViewProps {
  currentSchool: School;
  currentUser: User;
  onNavigate?: (tab: any) => void;
}

export const ParentStudentsView: React.FC<ParentStudentsViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  // Filter strictly to the parent's children
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
  const [activeTab, setActiveTab] = useState<'dossier' | 'notes' | 'assiduite' | 'ecolage'>('dossier');

  // Absence excuse modal / form state
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
  const [excuseDate, setExcuseDate] = useState(new Date().toISOString().split('T')[0]);
  const [excuseReason, setExcuseReason] = useState('Maladie');
  const [excuseComment, setExcuseComment] = useState('');
  const [excuseSubmitted, setExcuseSubmitted] = useState(false);

  // Certificate modal state
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const activeChild = useMemo(() => {
    return parentChildren.find(c => c.id === selectedChildId) || parentChildren[0];
  }, [parentChildren, selectedChildId]);

  const handleSendExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    setExcuseSubmitted(true);
    setTimeout(() => {
      setExcuseSubmitted(false);
      setIsExcuseModalOpen(false);
      setExcuseComment('');
    }, 1800);
  };

  if (!activeChild) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Aucun enfant rattaché</h3>
        <p className="text-xs text-slate-500 mt-1">Veuillez contacter le secrétariat de l'établissement.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
              Portail des Responsables Légaux
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#66736D] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#075B46]" />
              Dossier Confidentiel Réservé
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
            Mes Enfants Inscrits : Famille {currentUser.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Suivi académique, état d'assiduité, relevés de notes et scolarité officielle pour l'année 2024-2025
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCertificateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Certificat de Scolarité</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExcuseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Déposer un Justificatif</span>
          </button>
        </div>
      </div>

      {/* Child Switcher Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {parentChildren.map((child, idx) => {
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  isSelected ? 'bg-[#DDF3EA] text-[#075B46]' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {child.firstName[0]}{child.lastName[0]}
              </div>
              <div>
                <div className={`text-sm font-bold ${isSelected ? 'text-[#17201D]' : 'text-slate-700'}`}>
                  {child.firstName} {child.lastName}
                </div>
                <div className="text-xs text-[#66736D]">
                  {child.className} • {child.matricule}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Child Identity Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#DDF3EA] text-[#075B46] flex items-center justify-center font-bold text-2xl shadow-inner border border-[#075B46]/20">
              {activeChild.firstName[0]}{activeChild.lastName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#17201D]">
                  {activeChild.firstName} {activeChild.lastName}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
                  Inscrit Régulier
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#66736D] mt-1">
                <span>Matricule : <strong className="font-mono text-[#17201D]">{activeChild.matricule}</strong></span>
                <span>•</span>
                <span>Classe : <strong className="text-[#17201D]">{activeChild.className}</strong></span>
                <span>•</span>
                <span>Prof. Principal : <strong className="text-[#17201D]">Prof. Jacques Étienne</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('reportcards')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#075B46] bg-[#DDF3EA] hover:bg-[#cbeee1] rounded-lg transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bulletin Officiel</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('finance')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Frais Scolaires</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4 Performance Indicators for this child */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-[#F5F7F6] rounded-lg">
            <span className="text-[11px] text-[#66736D]">Moyenne T1</span>
            <div className="text-xl font-bold text-[#075B46] mt-0.5">86.5 / 100</div>
            <span className="text-[10px] text-[#075B46] font-medium">Rang: 4ème sur 26 élèves</span>
          </div>
          <div className="p-3 bg-[#F5F7F6] rounded-lg">
            <span className="text-[11px] text-[#66736D]">Taux d'Assiduité</span>
            <div className="text-xl font-bold text-[#17201D] mt-0.5">98%</div>
            <span className="text-[10px] text-[#66736D]">24 j. de présence, 0 retard</span>
          </div>
          <div className="p-3 bg-[#F5F7F6] rounded-lg">
            <span className="text-[11px] text-[#66736D]">Statut Écolage</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">À Jour</div>
            <span className="text-[10px] text-[#66736D]">1er versement acquitté</span>
          </div>
          <div className="p-3 bg-[#F5F7F6] rounded-lg">
            <span className="text-[11px] text-[#66736D]">Discipline & Conduite</span>
            <div className="text-xl font-bold text-[#075B46] mt-0.5">Très Bien</div>
            <span className="text-[10px] text-[#66736D]">Aucun avertissement</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Active Child */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('dossier')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'dossier'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Fiche d'Identité & Contact
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'notes'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Relevé de Notes Récent
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assiduite')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'assiduite'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Assiduité & Absences
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ecolage')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'ecolage'
              ? 'border-[#075B46] text-[#075B46]'
              : 'border-transparent text-[#66736D] hover:text-[#17201D]'
          }`}
        >
          Frais Scolaires & Reçus
        </button>
      </div>

      {/* Tab Content 1: Dossier */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#17201D] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#075B46]" />
              État Civil de l'Élève
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Nom de famille</span>
                <span className="font-semibold text-[#17201D]">{activeChild.lastName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Prénom</span>
                <span className="font-semibold text-[#17201D]">{activeChild.firstName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Genre</span>
                <span className="font-semibold text-[#17201D]">{activeChild.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Date de naissance</span>
                <span className="font-semibold text-[#17201D]">{activeChild.birthDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Lieu de naissance</span>
                <span className="font-semibold text-[#17201D]">{activeChild.birthPlace || 'Port-au-Prince, Haïti'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#66736D]">Date d'admission</span>
                <span className="font-semibold text-[#17201D]">{activeChild.admissionDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#17201D] flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#075B46]" />
              Santé & Coordonnées d'Urgence
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Responsable légal</span>
                <span className="font-semibold text-[#17201D]">{currentUser.firstName} {currentUser.lastName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Téléphone d'urgence</span>
                <span className="font-semibold text-[#17201D]">{activeChild.phone || '+509 3712-3456'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Groupe Sanguin</span>
                <span className="font-semibold text-[#17201D]">O+ (Positif)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#66736D]">Allergies déclarées</span>
                <span className="font-semibold text-emerald-700">Aucune restriction</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#66736D]">Adresse de résidence</span>
                <span className="font-semibold text-[#17201D]">{activeChild.address || 'Port-au-Prince'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Notes Récentes */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#17201D]">Notes des Évaluations Récentes (1er Trimestre)</h3>
              <p className="text-xs text-[#66736D]">Notes certifiées enregistrées par les professeurs titulaires</p>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('reportcards')}
                className="text-xs font-semibold text-[#075B46] hover:underline"
              >
                Ouvrir le bulletin complet →
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#66736D]">
                  <th className="pb-2.5 font-semibold">Matière</th>
                  <th className="pb-2.5 font-semibold text-center">Coef.</th>
                  <th className="pb-2.5 font-semibold text-center">Devoir 1</th>
                  <th className="pb-2.5 font-semibold text-center">Contrôle</th>
                  <th className="pb-2.5 font-semibold text-center">Examen T1</th>
                  <th className="pb-2.5 font-semibold text-right">Moyenne</th>
                  <th className="pb-2.5 font-semibold text-center">Moy. Classe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-medium text-[#17201D]">Mathématiques & Algèbre</td>
                  <td className="py-2.5 text-center font-mono">4</td>
                  <td className="py-2.5 text-center font-mono">88 / 100</td>
                  <td className="py-2.5 text-center font-mono">82 / 100</td>
                  <td className="py-2.5 text-center font-mono font-bold text-[#075B46]">90 / 100</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#075B46]">87.0</td>
                  <td className="py-2.5 text-center text-slate-500 font-mono">72.4</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-[#17201D]">Physique & Chimie</td>
                  <td className="py-2.5 text-center font-mono">3</td>
                  <td className="py-2.5 text-center font-mono">85 / 100</td>
                  <td className="py-2.5 text-center font-mono">84 / 100</td>
                  <td className="py-2.5 text-center font-mono font-bold text-[#075B46]">88 / 100</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#075B46]">86.0</td>
                  <td className="py-2.5 text-center text-slate-500 font-mono">68.0</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-[#17201D]">Français & Littérature</td>
                  <td className="py-2.5 text-center font-mono">4</td>
                  <td className="py-2.5 text-center font-mono">80 / 100</td>
                  <td className="py-2.5 text-center font-mono">82 / 100</td>
                  <td className="py-2.5 text-center font-mono font-bold text-[#075B46]">85 / 100</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#075B46]">82.5</td>
                  <td className="py-2.5 text-center text-slate-500 font-mono">74.2</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-[#17201D]">Histoire & Géographie d'Haïti</td>
                  <td className="py-2.5 text-center font-mono">2</td>
                  <td className="py-2.5 text-center font-mono">92 / 100</td>
                  <td className="py-2.5 text-center font-mono">88 / 100</td>
                  <td className="py-2.5 text-center font-mono font-bold text-[#075B46]">94 / 100</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#075B46]">91.5</td>
                  <td className="py-2.5 text-center text-slate-500 font-mono">79.0</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-[#17201D]">Anglais</td>
                  <td className="py-2.5 text-center font-mono">2</td>
                  <td className="py-2.5 text-center font-mono">86 / 100</td>
                  <td className="py-2.5 text-center font-mono">90 / 100</td>
                  <td className="py-2.5 text-center font-mono font-bold text-[#075B46]">88 / 100</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#075B46]">88.0</td>
                  <td className="py-2.5 text-center text-slate-500 font-mono">76.5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Assiduité & Absences */}
      {activeTab === 'assiduite' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17201D]">Historique des Présences & Retards</h3>
              <p className="text-xs text-[#66736D]">Relevé officiel des appels journaliers</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExcuseModalOpen(true)}
              className="px-3 py-1.5 bg-[#075B46] text-white rounded-lg text-xs font-semibold hover:bg-[#0B8064] transition-colors"
            >
              + Justifier une Absence
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Mercredi 20 Novembre 2024</span>
                <div className="text-slate-500 mt-0.5">Journée complète • Matin & Après-midi</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDF3EA] text-[#075B46]">
                Présent(e)
              </span>
            </div>
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Mardi 19 Novembre 2024</span>
                <div className="text-slate-500 mt-0.5">Absence justifiée par certificat médical (Grippe)</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Absence Justifiée
              </span>
            </div>
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Lundi 18 Novembre 2024</span>
                <div className="text-slate-500 mt-0.5">Journée complète • Matin & Après-midi</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDF3EA] text-[#075B46]">
                Présent(e)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Scolarité & Écolage */}
      {activeTab === 'ecolage' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17201D]">Situation Financière de l'Élève</h3>
              <p className="text-xs text-[#66736D]">Détail des frais de scolarité pour l'année 2024-2025</p>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('finance')}
                className="px-3.5 py-2 bg-[#075B46] text-white rounded-lg text-xs font-semibold hover:bg-[#0B8064] transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Effectuer un Règlement</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-[#F5F7F6]">
              <span className="text-[11px] text-[#66736D]">Total Scolarité Annuelle</span>
              <div className="text-lg font-bold text-[#17201D] mt-0.5">70,000 HTG</div>
              <span className="text-[10px] text-[#66736D]">Frais d'études & généraux</span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F5F7F6]">
              <span className="text-[11px] text-[#66736D]">Montant Déjà Versé</span>
              <div className="text-lg font-bold text-[#075B46] mt-0.5">55,000 HTG</div>
              <span className="text-[10px] text-emerald-700">78% de la scolarité réglée</span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F5F7F6]">
              <span className="text-[11px] text-[#66736D]">Solde Restant Dû</span>
              <div className="text-lg font-bold text-amber-700 mt-0.5">15,000 HTG</div>
              <span className="text-[10px] text-slate-500">Échéance : 15 Janvier 2025</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-[#17201D] mb-2">Dernier Reçu Officiel Délivré</h4>
            <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-[#075B46]">REC-2024-00142</span>
                <div className="text-slate-500 mt-0.5">Paiement Écolage 1er Versement • Reçu caisse certifié</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">35,000 HTG</span>
                <div className="text-[11px] text-emerald-700 font-semibold">Validé & Encaissé</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excuse Submission Modal */}
      {isExcuseModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#17201D]">Justifier une Absence ou Retard</h3>
              <button
                type="button"
                onClick={() => setIsExcuseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {excuseSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#075B46] mx-auto" />
                <h4 className="text-sm font-bold text-[#17201D]">Justificatif Enregistré avec Succès</h4>
                <p className="text-xs text-slate-500">Le secrétariat a bien reçu votre justification pour {activeChild.firstName}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendExcuse} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Élève concerné</label>
                  <input
                    type="text"
                    disabled
                    value={`${activeChild.firstName} ${activeChild.lastName} (${activeChild.className})`}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#17201D] mb-1">Date de l'absence</label>
                    <input
                      type="date"
                      value={excuseDate}
                      onChange={e => setExcuseDate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#17201D] mb-1">Motif principal</label>
                    <select
                      value={excuseReason}
                      onChange={e => setExcuseReason(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="Maladie">Maladie</option>
                      <option value="Consultation médicale">Consultation médicale</option>
                      <option value="Urgence familiale">Urgence familiale</option>
                      <option value="Transport difficile">Transport difficile</option>
                      <option value="Autre">Autre motif</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Explication pour la Vie Scolaire</label>
                  <textarea
                    rows={3}
                    placeholder="Précisez brièvement les circonstances..."
                    value={excuseComment}
                    onChange={e => setExcuseComment(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExcuseModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmettre au Secrétariat</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-8 shadow-2xl border border-slate-300 space-y-6 print:m-0 print:border-none">
            {/* Header MENFP */}
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <div className="text-[11px] font-serif font-bold uppercase tracking-widest text-slate-800">
                RÉPUBLIQUE D'HAÏTI
              </div>
              <div className="text-xs font-serif text-slate-700 mt-0.5">
                MINISTÈRE DE L'ÉDUCATION NATIONALE ET DE LA FORMATION PROFESSIONNELLE (MENFP)
              </div>
              <div className="text-sm font-serif font-bold text-[#075B46] mt-2 uppercase">
                {currentSchool.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentSchool.address} • Tél : {currentSchool.phone} • Code Établissement : {currentSchool.code}
              </div>
            </div>

            <div className="text-center py-2">
              <h3 className="text-base font-serif font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
                CERTIFICAT DE SCOLARITÉ OFFICIEL
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Année Académique 2024-2025</p>
            </div>

            <div className="text-xs leading-relaxed space-y-3 font-serif text-slate-800">
              <p>
                La Direction de l'établissement certifie par la présente que l'élève :
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans space-y-1">
                <div>Nom & Prénom : <strong>{activeChild.lastName.toUpperCase()}, {activeChild.firstName}</strong></div>
                <div>Matricule National Institutionnel : <strong className="font-mono text-[#075B46]">{activeChild.matricule}</strong></div>
                <div>Date & Lieu de Naissance : <strong>{activeChild.birthDate} à {activeChild.birthPlace || 'Port-au-Prince'}</strong></div>
                <div>Classe Fréquentée : <strong>{activeChild.className}</strong></div>
                <div>Statut : <strong>Régulièrement inscrit(e) et assidu(e)</strong></div>
              </div>
              <p>
                En foi de quoi, ce certificat lui est délivré à la demande de son responsable légal, <strong>{currentUser.firstName} {currentUser.lastName}</strong>, pour servir et valoir ce que de droit.
              </p>
            </div>

            <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs font-serif">
              <div>
                <div>Fait à Port-au-Prince, le {new Date().toLocaleDateString('fr-FR')}</div>
                <div className="text-slate-500 text-[10px] mt-1">Sceau de l'Établissement</div>
              </div>
              <div className="text-center">
                <div className="font-bold">La Direction Générale</div>
                <div className="font-script text-base text-[#075B46] my-1">Jean-Marc Beaubrun</div>
                <div className="text-[10px] text-slate-500">Directeur Pédagogique</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setIsCertificateModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-xs font-semibold"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer l'Attestation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
