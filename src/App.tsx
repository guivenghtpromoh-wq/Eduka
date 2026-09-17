/**
 * EDUKA - Enterprise Multi-Tenant School Management Platform
 */

import React, { useState, useEffect } from 'react';
import { School, User } from './types';
import { db } from './services/db';
import { auth } from './services/auth';
import { syncEngine, NetworkStatus } from './services/sync';
import { Locale } from './services/i18n';

// Navigation & Layout Components
import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { AuthLoginView } from './components/auth/AuthLoginView';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SyncCenterModal } from './components/common/SyncCenterModal';
import { PermissionDeniedState } from './components/common/UIStates';

// Module Views
import { DashboardView } from './components/modules/DashboardView';
import { StudentsView } from './components/modules/StudentsView';
import { AttendanceView } from './components/modules/AttendanceView';
import { GradesView } from './components/modules/GradesView';
import { ReportCardsView } from './components/modules/ReportCardsView';
import { FinanceView } from './components/modules/FinanceView';
import { ClassesView } from './components/modules/ClassesView';
import { TeachersView } from './components/modules/TeachersView';
import { TimetableView } from './components/modules/TimetableView';
import { AdmissionsView } from './components/modules/AdmissionsView';
import { DocumentsView } from './components/modules/DocumentsView';
import { CommunicationView } from './components/modules/CommunicationView';
import { SecurityCenterView } from './components/modules/SecurityCenterView';
import { SettingsView } from './components/modules/SettingsView';

export default function App() {
  // App State
  const [schools, setSchools] = useState<School[]>(() => db.getSchools());
  const [currentSchool, setCurrentSchool] = useState<School>(() => db.getSchools()[0]);
  const [currentUser, setCurrentUser] = useState<User>(() => auth.getCurrentUser());
  const [currentLocale, setCurrentLocale] = useState<Locale>('fr');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('eduka_authenticated') === 'true';
  });

  // Network & Sync State
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => syncEngine.getStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Modals & Navigation Deep Links
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string | undefined>(undefined);
  const [targetInvoiceId, setTargetInvoiceId] = useState<string | undefined>(undefined);

  // Sync Engine listener
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe(status => {
      setNetworkStatus(status);
      const queue = db.getSyncQueue();
      setPendingSyncCount(queue.filter(q => q.status === 'pending').length);
    });

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle Switch User
  const handleUserChange = (user: User) => {
    auth.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  // Handle Switch School (Multi-Tenant tester)
  const handleSchoolChange = (school: School) => {
    setCurrentSchool(school);
    setActiveTab('dashboard');
  };

  // Handle Deep Navigation from search or quick buttons
  const handleNavigate = (tab: ActiveTab, entityId?: string) => {
    setActiveTab(tab);
    if (tab === 'students' && entityId) {
      setTargetStudentId(entityId);
    } else if (tab === 'finance' && entityId) {
      setTargetInvoiceId(entityId);
    }
  };

  // Check Granular RBAC Permissions for Current View
  const isViewAuthorized = (tab: ActiveTab): boolean => {
    switch (tab) {
      case 'dashboard':
        return true;
      case 'students':
        return auth.hasPermission('students.read');
      case 'attendance':
        return auth.hasPermission('attendance.read');
      case 'grades':
        return auth.hasPermission('grades.read');
      case 'reportcards':
        return auth.hasPermission('grades.read') || currentUser.role === 'parent' || currentUser.role === 'eleve';
      case 'finance':
        return auth.hasPermission('finance.read') || currentUser.role === 'parent';
      case 'classes':
        return auth.hasPermission('classes.read');
      case 'teachers':
        return auth.hasPermission('teachers.read');
      case 'timetable':
        return true;
      case 'admissions':
        return auth.hasPermission('students.create') || auth.hasRole(['admin', 'direction', 'secretaire']);
      case 'documents':
        return auth.hasPermission('documents.read');
      case 'communication':
        return true;
      case 'security':
        return auth.hasPermission('audit.read') || auth.hasRole(['admin', 'direction']);
      case 'settings':
        return auth.hasPermission('settings.update') || auth.hasRole(['admin', 'direction']);
      default:
        return true;
    }
  };

  const authorized = isViewAuthorized(activeTab);

  // Authentication & Session Handlers
  const handleLoginSuccess = (user: User) => {
    handleUserChange(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('eduka_authenticated', 'true');
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    sessionStorage.removeItem('eduka_authenticated');
    setActiveTab('dashboard');
  };

  // If user is not yet logged in, present official Connexion screen
  if (!isAuthenticated) {
    return <AuthLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-[#17201D] font-sans antialiased flex flex-col selection:bg-[#075B46] selection:text-white">
      
      {/* Institutional Top Navbar */}
      <Navbar
        schools={schools}
        currentSchool={currentSchool}
        onSchoolChange={handleSchoolChange}
        onSelectSchool={(id) => {
          const s = schools.find(item => item.id === id);
          if (s) handleSchoolChange(s);
        }}
        currentUser={currentUser}
        currentLocale={currentLocale}
        onLocaleChange={setCurrentLocale}
        onSelectLocale={setCurrentLocale}
        networkStatus={networkStatus}
        pendingSyncCount={pendingSyncCount}
        syncQueueCount={pendingSyncCount}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSyncCenter={() => setIsSyncCenterOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        onLogout={handleLogout}
      />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex flex-1">
        
        {/* Institutional Sidebar (Desktop & Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          currentLocale={currentLocale}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

          {/* Main Module Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-10 max-w-7xl mx-auto w-full">
            {!authorized ? (
              <PermissionDeniedState
                onAction={() => setActiveTab('dashboard')}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                    currentLocale={currentLocale}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'students' && (
                  <StudentsView
                    currentSchool={currentSchool}
                    initialSelectedStudentId={targetStudentId}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'attendance' && (
                  <AttendanceView
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'grades' && (
                  <GradesView
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'reportcards' && (
                  <ReportCardsView
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'finance' && (
                  <FinanceView
                    currentSchool={currentSchool}
                    initialInvoiceId={targetInvoiceId}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'classes' && (
                  <ClassesView
                    currentSchool={currentSchool}
                    onNavigateToAttendance={() => setActiveTab('attendance')}
                  />
                )}

                {activeTab === 'teachers' && (
                  <TeachersView
                    currentSchool={currentSchool}
                  />
                )}

                {activeTab === 'timetable' && (
                  <TimetableView
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'admissions' && (
                  <AdmissionsView
                    currentSchool={currentSchool}
                    onStudentEnrolled={(studentId) => {
                      setTargetStudentId(studentId);
                      setActiveTab('students');
                    }}
                  />
                )}

                {activeTab === 'documents' && (
                  <DocumentsView
                    currentSchool={currentSchool}
                  />
                )}

                {activeTab === 'communication' && (
                  <CommunicationView
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'security' && (
                  <SecurityCenterView
                    currentSchool={currentSchool}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    currentSchool={currentSchool}
                    onSchoolUpdated={(updated) => {
                      setCurrentSchool(updated);
                      setSchools(db.getSchools());
                    }}
                  />
                )}
              </>
            )}
          </main>

        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onTabChange={setActiveTab}
          currentLocale={currentLocale}
          onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
        />

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Sync Center Modal */}
        <SyncCenterModal
          isOpen={isSyncCenterOpen}
          onClose={() => setIsSyncCenterOpen(false)}
          networkStatus={networkStatus}
        />

    </div>
  );
}
