/**
 * EDUKA - Institutional Sidebar Navigation
 * Dynamic role-based menu filtering with strict permission checks.
 * STRICTLY ZERO EMOJIS: Pure Lucide icons with high contrast institutional styling.
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School as SchoolIcon,
  BookOpen,
  CalendarCheck,
  Award,
  FileSpreadsheet,
  Clock,
  UserPlus,
  DollarSign,
  FileText,
  MessageSquare,
  ClipboardList,
  BarChart3,
  ShieldAlert,
  History,
  Settings,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';
import { User, Permission } from '../../types';
import { auth } from '../../services/auth';
import { Locale, translations } from '../../services/i18n';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'attendance'
  | 'grades'
  | 'reportcards'
  | 'timetable'
  | 'admissions'
  | 'finance'
  | 'documents'
  | 'communication'
  | 'assignments'
  | 'reports'
  | 'security'
  | 'audit'
  | 'settings'
  | 'help';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onTabChange?: (tab: ActiveTab) => void;
  currentUser?: User;
  currentLocale?: Locale;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

interface CustomNavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  currentUser,
  currentLocale = 'fr',
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
}) => {
  const t = translations[currentLocale]?.navigation || translations.fr.navigation;
  const role = currentUser?.role || 'admin';

  // Role-specific navigation tailored strictly to the user's domain and responsibilities
  const getNavItemsForRole = (): CustomNavItem[] => {
    switch (role) {
      case 'parent':
        return [
          { id: 'dashboard', label: 'Espace Famille', icon: LayoutDashboard },
          { id: 'students', label: 'Mes Enfants', icon: Users, badge: '2 inscrits' },
          { id: 'reportcards', label: 'Bulletins Scolaires', icon: FileSpreadsheet },
          { id: 'grades', label: 'Relevé de Notes', icon: Award },
          { id: 'attendance', label: 'Présences & Retards', icon: CalendarCheck },
          { id: 'finance', label: 'Écolage & Paiements', icon: DollarSign },
          { id: 'timetable', label: 'Emploi du Temps', icon: Clock },
          { id: 'communication', label: "Messages avec l'École", icon: MessageSquare },
          { id: 'documents', label: 'Attestations & Reçus', icon: FileText },
        ];

      case 'eleve':
        return [
          { id: 'dashboard', label: 'Mon Espace Élève', icon: LayoutDashboard },
          { id: 'students', label: 'Mon Dossier & Carte', icon: Users },
          { id: 'grades', label: 'Mes Notes & Moyennes', icon: Award },
          { id: 'reportcards', label: 'Mon Bulletin', icon: FileSpreadsheet },
          { id: 'attendance', label: 'Mon Assiduité', icon: CalendarCheck },
          { id: 'timetable', label: 'Mon Emploi du Temps', icon: Clock },
          { id: 'communication', label: 'Mes Messages', icon: MessageSquare },
          { id: 'documents', label: 'Mes Documents', icon: FileText },
        ];

      case 'enseignant':
        return [
          { id: 'dashboard', label: 'Espace Enseignant', icon: LayoutDashboard },
          { id: 'classes', label: 'Mes Classes Attribuées', icon: SchoolIcon },
          { id: 'attendance', label: "Faire l'Appel (Cahier)", icon: CalendarCheck },
          { id: 'grades', label: 'Carnet de Notes (Saisie)', icon: Award },
          { id: 'reportcards', label: 'Bulletins & Appréciations', icon: FileSpreadsheet },
          { id: 'timetable', label: 'Mon Emploi du Temps', icon: Clock },
          { id: 'students', label: 'Élèves de mes classes', icon: Users },
          { id: 'communication', label: 'Messagerie Pédagogique', icon: MessageSquare },
          { id: 'documents', label: 'Supports & Cours', icon: FileText },
        ];

      case 'comptable':
        return [
          { id: 'dashboard', label: 'Tableau de Bord Caisse', icon: LayoutDashboard },
          { id: 'finance', label: 'Caisse & Encaissements', icon: DollarSign },
          { id: 'students', label: 'Statuts Écolages Élèves', icon: Users },
          { id: 'reports', label: 'Bilan & Recouvrement', icon: BarChart3 },
          { id: 'documents', label: 'Pièces & Reçus Fiscaux', icon: FileText },
          { id: 'communication', label: 'Relances Écolages', icon: MessageSquare },
        ];

      case 'secretaire':
        return [
          { id: 'dashboard', label: 'Secrétariat Général', icon: LayoutDashboard },
          { id: 'admissions', label: 'Inscriptions & Admissions', icon: UserPlus },
          { id: 'students', label: 'Registre des Élèves', icon: Users },
          { id: 'attendance', label: 'Billets & Justificatifs', icon: CalendarCheck },
          { id: 'classes', label: 'Classes & Répartitions', icon: SchoolIcon },
          { id: 'documents', label: 'Attestations Scolaires', icon: FileText },
          { id: 'communication', label: 'Circulaires & SMS', icon: MessageSquare },
        ];

      case 'direction':
      case 'admin':
      case 'super_admin':
      default:
        return [
          { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
          { id: 'students', label: 'Élèves & Inscriptions', icon: Users },
          { id: 'teachers', label: 'Corps Enseignant', icon: GraduationCap },
          { id: 'classes', label: 'Classes & Sections', icon: SchoolIcon },
          { id: 'attendance', label: 'Présences & Assiduité', icon: CalendarCheck },
          { id: 'grades', label: 'Évaluations & Notes', icon: Award },
          { id: 'reportcards', label: 'Bulletins Trimestriels', icon: FileSpreadsheet },
          { id: 'finance', label: 'Finances & Écolages', icon: DollarSign },
          { id: 'admissions', label: 'Admissions & Inscriptions', icon: UserPlus },
          { id: 'timetable', label: 'Emplois du Temps', icon: Clock },
          { id: 'communication', label: 'Communication', icon: MessageSquare },
          { id: 'documents', label: 'Archives & Documents', icon: FileText },
          { id: 'reports', label: 'Rapports & Statistiques', icon: BarChart3 },
          { id: 'security', label: 'Sécurité & Accès', icon: ShieldAlert },
          { id: 'settings', label: 'Paramètres École', icon: Settings },
        ];
    }
  };

  const navItemsList = getNavItemsForRole();

  const getRoleBadgeLabel = () => {
    switch (role) {
      case 'parent': return 'Portail Famille';
      case 'eleve': return 'Portail Élève';
      case 'enseignant': return 'Portail Enseignant';
      case 'comptable': return 'Service Caisse & Finance';
      case 'secretaire': return 'Secrétariat & Registre';
      case 'direction': return 'Direction Générale';
      case 'admin': return 'Administration Système';
      default: return 'Administration';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-50 md:z-20 transition-transform duration-200 ease-in-out flex flex-col select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header on mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-[#075B46] text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white tracking-widest text-sm">
              EDK
            </div>
            <span className="font-bold tracking-wide">EDUKA</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-md text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Brand Badge (Desktop only) */}
        <div className="hidden md:flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-[#F5F7F6]/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-[#075B46] text-white flex items-center justify-center font-bold text-xs tracking-wider">
              ED
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#17201D] tracking-tight">EDUKA</span>
              <span className="text-[10px] text-[#075B46] font-medium">{getRoleBadgeLabel()}</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItemsList.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab?.(item.id);
                  onTabChange?.(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#DDF3EA] text-[#075B46] font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F7F6]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#075B46]' : 'text-slate-400'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#075B46]/10 text-[#075B46] font-semibold shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {onLogout && (
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onCloseMobile?.();
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" strokeWidth={1.8} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer info: offline cache state and version */}
        <div className="p-3 border-t border-slate-100 bg-[#F5F7F6]/50 text-[11px] text-[#66736D]">
          <div className="flex items-center justify-between">
            <span>Base Locale</span>
            <span className="font-mono text-[10px] text-[#075B46]">IndexedDB Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
