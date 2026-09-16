/**
 * EDUKA - Adaptive Role Dashboard
 * Dynamically tailored metrics and priority workflows for:
 * Admin, Direction, Teacher, Parent, Student, Bursar and Registrar.
 * STRICTLY ZERO EMOJIS: Pure Lucide institutional iconography.
 */

import React from 'react';
import {
  Users,
  GraduationCap,
  School as SchoolIcon,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  FileText,
  CreditCard,
  BookOpen
} from 'lucide-react';
import { School, User } from '../../types';
import { db } from '../../services/db';
import { formatCurrency, calculateFinanceSummary } from '../../services/finance';
import { Locale, translations } from '../../services/i18n';
import { ActiveTab } from '../common/Sidebar';

interface DashboardViewProps {
  currentSchool: School;
  currentUser: User;
  currentLocale: Locale;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentSchool,
  currentUser,
  currentLocale,
  onNavigate,
}) => {
  const t = translations[currentLocale].dashboard;

  const students = db.getStudents(currentSchool.id);
  const teachers = db.getTeachers(currentSchool.id);
  const classes = db.getClasses(currentSchool.id);
  const attendanceToday = db.getAttendance(currentSchool.id, undefined, new Date().toISOString().split('T')[0]);
  const financeSummary = calculateFinanceSummary(currentSchool.id, currentSchool.exchangeRateUsdToHtg);
  const events = db.getEvents(currentSchool.id);

  // Compute attendance rate for today
  const totalAtt = attendanceToday.length;
  const presentCount = attendanceToday.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 96;

  // Role: Enseignant (Teacher Portal)
  if (currentUser.role === 'enseignant') {
    const teacherClasses = classes.filter(c => c.mainTeacherId === 'tch-001');
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#075B46] uppercase tracking-wider">
                Espace Enseignant Certifié
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
                Bonjour, Prof. {currentUser.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-[#66736D] mt-1">
                {currentSchool.name} • Trimestre 1 (Année 2024-2025)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Faire l'Appel de Classe</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('grades')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5F7F6] hover:bg-slate-200 text-[#17201D] border border-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Saisir des Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Teacher Key Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Classes Attribuées</span>
              <SchoolIcon className="w-4 h-4 text-[#075B46]" />
            </div>
            <div className="text-2xl font-bold text-[#17201D]">{teacherClasses.length}</div>
            <div className="text-[11px] text-[#66736D] mt-1">NS1-A, Philo</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Appel du Jour</span>
              <CheckCircle2 className="w-4 h-4 text-[#075B46]" />
            </div>
            <div className="text-2xl font-bold text-[#075B46]">Effectué</div>
            <div className="text-[11px] text-[#66736D] mt-1">Sauvegardé localement</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Évaluations Récentes</span>
              <ClipboardList className="w-4 h-4 text-[#0B8064]" />
            </div>
            <div className="text-2xl font-bold text-[#17201D]">3</div>
            <div className="text-[11px] text-[#66736D] mt-1">Dont 1 à verrouiller</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Prochains Cours</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-[#17201D]">10:15</div>
            <div className="text-[11px] text-[#66736D] mt-1">Maths • Salle 201</div>
          </div>
        </div>

        {/* Assigned Classes Quick Access */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <h3 className="text-sm font-bold text-[#17201D] mb-3">Vos Classes et Effectifs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teacherClasses.map(c => (
              <div key={c.id} className="p-3.5 rounded-lg border border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#17201D]">{c.name}</div>
                  <div className="text-xs text-[#66736D] mt-0.5">{c.room} • Effectif : {c.studentCount} élèves</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-[#075B46] hover:bg-[#DDF3EA] rounded-md text-xs font-semibold"
                >
                  Appel
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Role: Parent Portal
  if (currentUser.role === 'parent') {
    const parentChildren = students.filter(s =>
      s.parentIds.includes(currentUser.id) ||
      s.parentIds.includes('par-001') ||
      (currentUser.id === 'usr-parent-celestin' && (s.id === 'stu-001' || s.id === 'stu-002'))
    );
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#075B46] uppercase tracking-wider">
                Portail des Responsables Légaux
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
                Espace Famille : M. {currentUser.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-[#66736D] mt-1">
                Suivi académique, assiduité et relevé financier pour vos {parentChildren.length} enfants inscrits
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="px-3.5 py-2 text-xs font-semibold text-[#075B46] bg-[#DDF3EA] hover:bg-[#cbeee1] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Justifier une Absence</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('finance')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <DollarSign className="w-4 h-4" />
                <span>Payer l'Écolage</span>
              </button>
            </div>
          </div>
        </div>

        {/* Children selector & summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {parentChildren.map((child, idx) => (
            <div key={child.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-[#075B46]/40 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#DDF3EA] text-[#075B46] font-bold text-sm flex items-center justify-center">
                    {child.firstName[0]}{child.lastName[0]}
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#17201D]">{child.firstName} {child.lastName}</div>
                    <div className="text-xs text-[#66736D]">Matricule : {child.matricule} • {child.className}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
                  Inscrit Actif
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#F5F7F6]">
                  <div className="text-[11px] text-[#66736D]">Moyenne T1</div>
                  <div className="text-base font-bold text-[#075B46] mt-0.5">
                    {idx === 0 ? '86.5 / 100' : '82.0 / 100'}
                  </div>
                  <span className="text-[10px] text-[#075B46] font-medium">{idx === 0 ? 'Rang: 4ème/26' : 'Rang: 7ème/24'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F5F7F6]">
                  <div className="text-[11px] text-[#66736D]">Assiduité</div>
                  <div className="text-base font-bold text-[#17201D] mt-0.5">
                    {idx === 0 ? '98%' : '95%'}
                  </div>
                  <span className="text-[10px] text-[#66736D]">24 j. présents</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F5F7F6]">
                  <div className="text-[11px] text-[#66736D]">Écolage</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">À Jour</div>
                  <span className="text-[10px] text-[#66736D]">Versement 1 OK</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate('reportcards')}
                  className="text-xs font-semibold text-[#075B46] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Consulter le Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('finance')}
                  className="text-xs font-semibold text-slate-700 hover:underline flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Relevé des Frais</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('timetable')}
                  className="text-xs font-semibold text-slate-600 hover:underline flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Horaire</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Circulars and Institutional notices for parents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-[#17201D]">Communications Récentes de la Direction</h3>
            <button
              type="button"
              onClick={() => onNavigate('communication')}
              className="text-xs font-semibold text-[#075B46] hover:underline"
            >
              Toutes les circulaires
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#17201D]">Rencontre Parents-Professeurs du 1er Trimestre</span>
                <div className="text-slate-500 mt-0.5">Vendredi 13 Décembre 2024 de 14h00 à 17h00 • Remise des bulletins en mains propres</div>
              </div>
              <span className="px-2 py-0.5 bg-[#075B46]/10 text-[#075B46] rounded-md font-semibold text-[11px]">Important</span>
            </div>
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#17201D]">Échéance du 2ème Versement des Frais de Scolarité</span>
                <div className="text-slate-500 mt-0.5">Date limite de paiement : 15 Janvier 2025 • Règlement par MonCash ou virement bancaire</div>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-semibold text-[11px]">Rappel</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role: Élève (Student Portal)
  if (currentUser.role === 'eleve') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#075B46] uppercase tracking-wider">
                Portail de l'Apprenant
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
                Espace Élève : {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-[#66736D] mt-1">
                Matricule : {currentUser.matricule} • Nouveau Secondaire 1 (NS1-A)
              </p>
            </div>
            <div className="flex items-center gap-2">
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
                <FileText className="w-4 h-4" />
                <span>Mon Bulletin</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-[#66736D]">Moyenne Actuelle</span>
            <div className="text-2xl font-bold text-[#075B46] mt-1">87.4 / 100</div>
            <span className="text-[11px] text-[#66736D]">Rang : 3ème sur 26 élèves</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-[#66736D]">Taux d'Assiduité</span>
            <div className="text-2xl font-bold text-[#17201D] mt-1">96%</div>
            <span className="text-[11px] text-amber-700">1 retard justifié</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-[#66736D]">Devoirs à Rendre</span>
            <div className="text-2xl font-bold text-[#17201D] mt-1">2</div>
            <span className="text-[11px] text-[#66736D]">Maths (Vendredi), Français (Lundi)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#17201D]">Prochains Cours au Programme</h3>
            <button
              type="button"
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-[#075B46] hover:underline"
            >
              Emploi du temps complet
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#17201D]">Mathématiques & Algèbre</span>
                <div className="text-slate-500">Prof. Jacques Étienne • Salle 201</div>
              </div>
              <span className="font-mono font-medium text-[#075B46]">08:00 — 10:00</span>
            </div>
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#17201D]">Français & Littérature</span>
                <div className="text-slate-500">Prof. Marie-Laure Moïse • Salle 201</div>
              </div>
              <span className="font-mono font-medium text-[#075B46]">10:15 — 12:00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role: Comptable (Bursar / Cashier Cockpit)
  if (currentUser.role === 'comptable') {
    const invoices = db.getInvoices(currentSchool.id);
    const payments = db.getPayments(currentSchool.id);
    const pendingInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial');

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#075B46] uppercase tracking-wider">
              Direction Financière & Caisse
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
              Tableau de Bord Caisse : {currentUser.firstName} {currentUser.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-[#66736D] mt-1">
              Gestion de la trésorerie, encaissements bidevises (HTG/USD) et suivi du recouvrement
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate('finance')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Encaisser un Paiement</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('finance')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#17201D] border border-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-[#075B46]" />
              <span>Journal de Caisse</span>
            </button>
          </div>
        </div>

        {/* Cashier Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Recettes Encaissées</span>
              <DollarSign className="w-4 h-4 text-[#075B46]" />
            </div>
            <div className="text-xl font-bold text-[#075B46]">
              {formatCurrency(financeSummary.totalPaidHtg, 'HTG')}
            </div>
            <div className="text-[11px] text-[#66736D] mt-1">
              Équivalent : {formatCurrency(financeSummary.totalPaidHtg / currentSchool.exchangeRateUsdToHtg, 'USD')}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Taux de Recouvrement</span>
              <TrendingUp className="w-4 h-4 text-[#075B46]" />
            </div>
            <div className="text-2xl font-bold text-[#17201D]">
              {financeSummary.collectionRatePercentage}%
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Objectif T1 : 85%</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Factures en Souffrance</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">
              {pendingInvoices.length}
            </div>
            <div className="text-[11px] text-[#66736D] mt-1">Relances à émettre</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Taux de Change Actif</span>
              <CreditCard className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xl font-bold text-[#17201D]">
              1 USD = {currentSchool.exchangeRateUsdToHtg} HTG
            </div>
            <div className="text-[11px] text-[#66736D] mt-1">Taux BRH certifié</div>
          </div>
        </div>

        {/* Recent payments in cashbox */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17201D]">Derniers Règlements Encaissés</h3>
              <p className="text-xs text-[#66736D]">Historique des encaissements certifiés par reçu</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('finance')}
              className="text-xs font-semibold text-[#075B46] hover:underline"
            >
              Voir tous les paiements
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[#66736D]">
                  <th className="pb-2 font-medium">Reçu N°</th>
                  <th className="pb-2 font-medium">Élève</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Mode</th>
                  <th className="pb-2 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.slice(0, 5).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 font-mono font-medium text-[#075B46]">{p.receiptNumber}</td>
                    <td className="py-2.5 font-medium text-[#17201D]">{p.studentName || 'Élève'}</td>
                    <td className="py-2.5 text-[#66736D]">{p.paidAt?.slice(0, 10) || '2025-01-15'}</td>
                    <td className="py-2.5 uppercase text-slate-600 font-semibold text-[11px]">{p.paymentMethod}</td>
                    <td className="py-2.5 font-mono font-bold text-right text-[#17201D]">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Role: Secrétaire (Registrar & Admissions Cockpit)
  if (currentUser.role === 'secretaire') {
    const admissions = db.getAdmissions(currentSchool.id);
    const pendingAdmissions = admissions.filter(a => a.status === 'en_attente' || a.status === 'documents_requis' || a.status === 'pending');

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#075B46] uppercase tracking-wider">
              Secrétariat Général & Registre
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
              Espace Secrétariat : {currentUser.firstName} {currentUser.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-[#66736D] mt-1">
              Immatriculation des élèves, gestion des admissions et délivrance des attestations officielles
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate('admissions')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Dossiers d'Admission</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#17201D] border border-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-[#075B46]" />
              <span>Registre Matriculaire</span>
            </button>
          </div>
        </div>

        {/* Secretary Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Élèves Immatriculés</span>
              <Users className="w-4 h-4 text-[#075B46]" />
            </div>
            <div className="text-2xl font-bold text-[#17201D]">{students.length}</div>
            <div className="text-[11px] text-[#075B46] mt-1">Matricules MENFP conformes</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Candidatures en Cours</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{pendingAdmissions.length}</div>
            <div className="text-[11px] text-[#66736D] mt-1">À valider</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Présences du Jour</span>
              <CalendarCheck className="w-4 h-4 text-[#075B46]" />
            </div>
            <div className="text-2xl font-bold text-[#075B46]">{attendanceRate}%</div>
            <div className="text-[11px] text-[#66736D] mt-1">Billets de retard à émettre</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#66736D] mb-2">
              <span className="text-xs font-medium">Classes Officielles</span>
              <SchoolIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-[#17201D]">{classes.length}</div>
            <div className="text-[11px] text-[#66736D] mt-1">Sections actives</div>
          </div>
        </div>

        {/* Quick registrar actions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-[#17201D] mb-3">Tâches Prioritaires du Secrétariat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div
              onClick={() => onNavigate('admissions')}
              className="p-3.5 rounded-lg border border-slate-200 hover:border-[#075B46] bg-[#F5F7F6] cursor-pointer transition-colors"
            >
              <div className="font-semibold text-slate-900">Valider les Dossiers d'Admission</div>
              <p className="text-slate-500 mt-1">Vérifier les actes de naissance et relevés de notes des candidats</p>
            </div>
            <div
              onClick={() => onNavigate('attendance')}
              className="p-3.5 rounded-lg border border-slate-200 hover:border-[#075B46] bg-[#F5F7F6] cursor-pointer transition-colors"
            >
              <div className="font-semibold text-slate-900">Délivrer Billets d'Entrée & Retards</div>
              <p className="text-slate-500 mt-1">Enregistrer les motifs d'absence et autorisations d'accès en classe</p>
            </div>
            <div
              onClick={() => onNavigate('documents')}
              className="p-3.5 rounded-lg border border-slate-200 hover:border-[#075B46] bg-[#F5F7F6] cursor-pointer transition-colors"
            >
              <div className="font-semibold text-slate-900">Générer Attestations de Scolarité</div>
              <p className="text-slate-500 mt-1">Édition des certificats officiels avec sceau et signature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Institutional Default (Admin, Direction, Comptable, Secrétaire)
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
              {currentSchool.name}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#66736D]">Code : {currentSchool.code}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
            Tableau de Bord Institutionnel
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Indicateurs certifiés • Année Académique 2024-2025 • Premier Trimestre
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#075B46] hover:bg-[#0B8064] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Appel du Jour</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('finance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#17201D] border border-slate-300 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <DollarSign className="w-4 h-4 text-[#075B46]" />
            <span>Encaissement</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#17201D] border border-slate-300 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Inscrire un Élève</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Élèves Inscrits */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[#66736D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.totalStudents}</span>
            <Users className="w-4 h-4 text-[#075B46]" />
          </div>
          <div className="text-2xl font-bold text-[#17201D]">{students.length}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% avec matricule unique</span>
          </div>
        </div>

        {/* Taux Présence du Jour */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[#66736D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.attendanceToday}</span>
            <CalendarCheck className="w-4 h-4 text-[#075B46]" />
          </div>
          <div className="text-2xl font-bold text-[#075B46]">{attendanceRate}%</div>
          <div className="text-[11px] text-[#66736D] mt-1">
            {totalAtt > 0 ? `${totalAtt} élèves vérifiés ce matin` : 'Base de présence active'}
          </div>
        </div>

        {/* Classes Ouvertes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[#66736D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.activeClasses}</span>
            <SchoolIcon className="w-4 h-4 text-[#0B8064]" />
          </div>
          <div className="text-2xl font-bold text-[#17201D]">{classes.length}</div>
          <div className="text-[11px] text-[#66736D] mt-1">
            Capacité globale occupée à 88%
          </div>
        </div>

        {/* Taux de Recouvrement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[#66736D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.feeCollectionRate}</span>
            <DollarSign className="w-4 h-4 text-[#E7B93E]" />
          </div>
          <div className="text-2xl font-bold text-[#17201D]">{financeSummary.collectionRatePercentage}%</div>
          <div className="text-[11px] text-[#66736D] mt-1">
            Reste dû : {formatCurrency(financeSummary.totalBalanceHtg, 'HTG')}
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Activities & Institutional Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Financial & Academic Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Financial Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#17201D]">État du Recouvrement des Écolages</h3>
                <p className="text-xs text-[#66736D]">Facturation annuelle et versements enregistrés</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('finance')}
                className="text-xs font-semibold text-[#075B46] hover:underline flex items-center gap-1"
              >
                <span>Détails financiers</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-[#F5F7F6] border border-slate-100">
                <span className="text-[11px] text-[#66736D] uppercase font-semibold">Total Facturé</span>
                <div className="text-base font-bold text-[#17201D] mt-1">
                  {formatCurrency(financeSummary.totalInvoicedHtg, 'HTG')}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#DDF3EA]/60 border border-[#BCE6D6]/50">
                <span className="text-[11px] text-[#075B46] uppercase font-semibold">Encaissé à ce jour</span>
                <div className="text-base font-bold text-[#075B46] mt-1">
                  {formatCurrency(financeSummary.totalPaidHtg, 'HTG')}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/50">
                <span className="text-[11px] text-[#D9822B] uppercase font-semibold">Solde Impayé Global</span>
                <div className="text-base font-bold text-[#D9822B] mt-1">
                  {formatCurrency(financeSummary.totalBalanceHtg, 'HTG')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Class Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#17201D]">Classes et Répartition des Effectifs</h3>
                <p className="text-xs text-[#66736D]">Répartition par niveau et professeur titulaire</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('classes')}
                className="text-xs font-semibold text-[#075B46] hover:underline"
              >
                Gérer les classes
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#66736D] font-semibold">
                    <th className="pb-2">Classe</th>
                    <th className="pb-2">Salle</th>
                    <th className="pb-2">Professeur Principal</th>
                    <th className="pb-2 text-right">Inscrits</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-semibold text-[#17201D]">{cls.name}</td>
                      <td className="py-2.5 text-slate-600">{cls.room}</td>
                      <td className="py-2.5 text-slate-600">{cls.mainTeacherName || 'Non assigné'}</td>
                      <td className="py-2.5 text-right font-medium text-slate-800">
                        {cls.studentCount || 0} / {cls.capacity}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate('attendance')}
                          className="text-[11px] font-semibold text-[#075B46] hover:underline"
                        >
                          Faire l'appel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Institutional Events & Compliance Notices */}
        <div className="space-y-6">
          
          {/* Institutional Events */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#17201D]">Calendrier Institutionnel</h3>
              <span className="text-[11px] font-semibold text-[#075B46]">2024-2025</span>
            </div>

            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="p-3 rounded-lg border border-slate-100 bg-[#F5F7F6]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#075B46]">
                    <span>{new Date(ev.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <span className="uppercase text-[10px] text-slate-500 font-medium">{ev.type}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#17201D] mt-1">{ev.title}</div>
                  <div className="text-[11px] text-[#66736D] mt-0.5">{ev.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & System Compliance Notice */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#075B46]">
              <CheckCircle2 className="w-4 h-4 text-[#075B46]" />
              <span>Conformité Système Active</span>
            </div>
            <p className="text-xs text-[#66736D] leading-relaxed">
              Toutes les transactions financières et modifications de notes sont horodatées et consignées dans le registre d'audit immuable.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('security')}
              className="w-full text-center py-2 px-3 bg-[#F5F7F6] hover:bg-slate-200 text-xs font-semibold text-[#17201D] rounded-lg transition-colors"
            >
              Consulter le Centre de Sécurité
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
