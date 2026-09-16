/**
 * EDUKA - Institutional Topbar
 * Displays active school branch, academic year, global search trigger,
 * network/offline sync state, language selector, role switcher and user profile.
 */

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Search,
  Bell,
  Globe,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Menu,
  LogOut
} from 'lucide-react';
import { School, User, UserRole } from '../../types';
import { auth } from '../../services/auth';
import { Locale } from '../../services/i18n';
import { NetworkStatus } from '../../services/sync';
import { NetworkSyncIndicator } from './UIStates';

interface NavbarProps {
  schools: School[];
  currentSchool: School;
  onSelectSchool?: (schoolId: string) => void;
  onSchoolChange?: (school: School) => void;
  currentUser: User;
  onSwitchRole?: (role: UserRole) => void;
  onUserChange?: (user: User) => void;
  currentLocale: Locale;
  onSelectLocale?: (locale: Locale) => void;
  onLocaleChange?: (locale: Locale) => void;
  networkStatus: NetworkStatus;
  syncQueueCount?: number;
  pendingSyncCount?: number;
  onOpenSyncCenter?: () => void;
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schools,
  currentSchool,
  onSelectSchool,
  onSchoolChange,
  currentUser,
  onSwitchRole,
  onUserChange,
  currentLocale,
  onSelectLocale,
  onLocaleChange,
  networkStatus,
  syncQueueCount,
  pendingSyncCount,
  onOpenSyncCenter,
  onOpenSearch,
  onToggleMobileMenu,
  onLogout,
}) => {
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeQueueCount = syncQueueCount ?? pendingSyncCount ?? 0;

  const handleSelectSchool = (school: School) => {
    onSelectSchool?.(school.id);
    onSchoolChange?.(school);
    setShowSchoolDropdown(false);
  };

  const handleSelectLocale = (locale: Locale) => {
    onSelectLocale?.(locale);
    onLocaleChange?.(locale);
    setShowLangDropdown(false);
  };

  const handleSelectRole = (role: UserRole) => {
    onSwitchRole?.(role);
    if (onUserChange) {
      auth.switchRole(role);
      onUserChange(auth.getCurrentUser());
    }
    setShowRoleDropdown(false);
  };

  const rolesList: { id: UserRole; label: string }[] = [
    { id: 'admin', label: 'Administrateur Système' },
    { id: 'direction', label: 'Direction Académique' },
    { id: 'enseignant', label: 'Professeur / Enseignant' },
    { id: 'comptable', label: 'Service Comptabilité' },
    { id: 'secretaire', label: 'Secrétariat Général' },
    { id: 'parent', label: 'Parent d\'élève (Tuteur)' },
    { id: 'eleve', label: 'Compte Élève' },
    { id: 'super_admin', label: 'Super Administrateur Réseau' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16">
        
        {/* Left: Mobile Menu + School Selector */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onToggleMobileMenu?.()}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* School Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-[#F5F7F6] hover:bg-slate-100 transition-colors text-left text-xs sm:text-sm"
            >
              <Building2 className="w-4 h-4 text-[#075B46] shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-[#17201D] truncate max-w-[130px] sm:max-w-[200px]">
                  {currentSchool.name}
                </span>
                <span className="text-[10px] text-[#66736D] hidden sm:inline">
                  {currentSchool.city} • Année 2024-2025
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showSchoolDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#66736D] uppercase tracking-wider border-b border-slate-100 mb-1">
                  Établissements du Réseau
                </div>
                {schools.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSchool(s)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#DDF3EA]/40 transition-colors ${
                      s.id === currentSchool.id ? 'bg-[#DDF3EA] font-semibold text-[#075B46]' : 'text-slate-700'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-slate-500">{s.city} ({s.code}) • Devise : {s.defaultCurrency}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-[#F5F7F6] border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-[#66736D]">
              <Search className="w-4 h-4 text-[#66736D]" />
              <span>Rechercher élève, classe, facture...</span>
            </span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Sync, Language, Role Switcher */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Recherche rapide"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Network & Offline Status Indicator */}
          <NetworkSyncIndicator
            status={networkStatus}
            queueCount={activeQueueCount}
            onOpenSyncCenter={() => onOpenSyncCenter?.()}
          />

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 p-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              title="Changer de langue"
            >
              <Globe className="w-4 h-4 text-[#075B46]" />
              <span className="uppercase text-[11px]">{currentLocale}</span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectLocale('fr')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${currentLocale === 'fr' ? 'text-[#075B46] font-semibold bg-[#DDF3EA]' : 'text-slate-700'}`}
                >
                  Français (FR)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLocale('ht')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${currentLocale === 'ht' ? 'text-[#075B46] font-semibold bg-[#DDF3EA]' : 'text-slate-700'}`}
                >
                  Kreyòl Ayisyen (HT)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLocale('en')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${currentLocale === 'en' ? 'text-[#075B46] font-semibold bg-[#DDF3EA]' : 'text-slate-700'}`}
                >
                  English (EN)
                </button>
              </div>
            )}
          </div>

          {/* Quick Role Switcher (Crucial for multi-role platform evaluation) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left text-xs"
              title="Changer de rôle pour tester les permissions réelles"
            >
              <div className="w-6 h-6 rounded-full bg-[#075B46] text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="font-semibold text-[#17201D] text-xs">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-[10px] text-[#0B8064] font-medium capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <div className="text-[11px] font-semibold text-[#17201D]">
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div className="text-[10px] text-[#66736D]">{currentUser.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#075B46] bg-[#DDF3EA] px-1.5 py-0.5 rounded font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>MFA Activée • Session Sécurisée</span>
                  </div>
                </div>

                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[#66736D] uppercase tracking-wider">
                  Tester un autre rôle (RBAC)
                </div>

                {rolesList.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRole(r.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      r.id === currentUser.role ? 'font-semibold text-[#075B46] bg-[#DDF3EA]/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {r.id === currentUser.role && <UserCheck className="w-3.5 h-3.5 text-[#075B46]" />}
                  </button>
                ))}

                {onLogout && (
                  <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
