/**
 * EDUKA - Mobile Bottom Navigation
 * Minimum 44px touch targets, accessible icons, native mobile experience.
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  MessageSquare,
  Menu,
  FileSpreadsheet,
  DollarSign,
  CalendarCheck,
  Clock,
  School as SchoolIcon,
  BarChart3
} from 'lucide-react';
import { Locale } from '../../services/i18n';
import { ActiveTab } from './Sidebar';
import { User } from '../../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onTabChange?: (tab: ActiveTab) => void;
  currentLocale?: Locale;
  onOpenMoreMenu?: () => void;
  currentUser?: User;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  onOpenMoreMenu,
  currentUser,
}) => {
  const handleSelect = (tab: ActiveTab) => {
    onSelectTab?.(tab);
    onTabChange?.(tab);
  };

  const role = currentUser?.role || 'admin';

  // Role-customized 4 primary tabs
  const getPrimaryTabs = () => {
    switch (role) {
      case 'parent':
        return [
          { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
          { id: 'students' as ActiveTab, label: 'Mes Enfants', icon: Users },
          { id: 'reportcards' as ActiveTab, label: 'Bulletins', icon: FileSpreadsheet },
          { id: 'finance' as ActiveTab, label: 'Écolage', icon: DollarSign },
        ];
      case 'eleve':
        return [
          { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
          { id: 'grades' as ActiveTab, label: 'Mes Notes', icon: Award },
          { id: 'reportcards' as ActiveTab, label: 'Bulletin', icon: FileSpreadsheet },
          { id: 'timetable' as ActiveTab, label: 'Horaire', icon: Clock },
        ];
      case 'enseignant':
        return [
          { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
          { id: 'attendance' as ActiveTab, label: 'Appel', icon: CalendarCheck },
          { id: 'grades' as ActiveTab, label: 'Notes', icon: Award },
          { id: 'classes' as ActiveTab, label: 'Classes', icon: SchoolIcon },
        ];
      case 'comptable':
        return [
          { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
          { id: 'finance' as ActiveTab, label: 'Caisse', icon: DollarSign },
          { id: 'students' as ActiveTab, label: 'Écolages', icon: Users },
          { id: 'reports' as ActiveTab, label: 'Bilan', icon: BarChart3 },
        ];
      default:
        return [
          { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
          { id: 'students' as ActiveTab, label: 'Élèves', icon: Users },
          { id: 'grades' as ActiveTab, label: 'Notes', icon: Award },
          { id: 'finance' as ActiveTab, label: 'Finance', icon: DollarSign },
        ];
    }
  };

  const primaryTabs = getPrimaryTabs();

  return (
    <nav aria-label="Navigation mobile" className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 shadow-lg no-print select-none">
      <div className="flex items-center justify-around h-14">
        {primaryTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 rounded-lg transition-colors ${
                isActive ? 'text-[#075B46]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Plus (Drawer) */}
        <button
          type="button"
          onClick={() => onOpenMoreMenu?.()}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-normal">
            Plus
          </span>
        </button>

      </div>
    </nav>
  );
};
