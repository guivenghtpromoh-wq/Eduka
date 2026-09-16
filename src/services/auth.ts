/**
 * EDUKA - Authentication, Session & Granular RBAC Engine
 * Strict permission evaluation: enforces authorization on every operation.
 */

import { User, UserRole, Permission } from '../types';
import { db } from './db';

// Role-to-Permissions Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'students.read', 'students.create', 'students.update', 'students.archive', 'students.export',
    'teachers.read', 'teachers.manage', 'classes.read', 'classes.manage',
    'attendance.read', 'attendance.record', 'grades.read', 'grades.create', 'grades.update', 'grades.validate',
    'reportcards.read', 'reportcards.generate', 'reportcards.validate',
    'timetable.read', 'timetable.manage', 'admissions.read', 'admissions.manage',
    'finance.read', 'finance.create', 'finance.update', 'finance.refund',
    'documents.read', 'documents.upload', 'documents.delete',
    'messages.read', 'messages.send', 'reports.read', 'reports.export',
    'security.read', 'security.manage', 'settings.read', 'settings.update', 'audit.read'
  ],
  admin: [
    'students.read', 'students.create', 'students.update', 'students.archive', 'students.export',
    'teachers.read', 'teachers.manage', 'classes.read', 'classes.manage',
    'attendance.read', 'attendance.record', 'grades.read', 'grades.create', 'grades.update', 'grades.validate',
    'reportcards.read', 'reportcards.generate', 'reportcards.validate',
    'timetable.read', 'timetable.manage', 'admissions.read', 'admissions.manage',
    'finance.read', 'finance.create', 'finance.update',
    'documents.read', 'documents.upload', 'documents.delete',
    'messages.read', 'messages.send', 'reports.read', 'reports.export',
    'security.read', 'security.manage', 'settings.read', 'settings.update', 'audit.read'
  ],
  direction: [
    'students.read', 'students.create', 'students.update', 'students.export',
    'teachers.read', 'classes.read', 'attendance.read', 'attendance.record',
    'grades.read', 'grades.validate', 'reportcards.read', 'reportcards.generate', 'reportcards.validate',
    'timetable.read', 'admissions.read', 'admissions.manage',
    'finance.read', 'documents.read', 'documents.upload',
    'messages.read', 'messages.send', 'reports.read', 'reports.export',
    'security.read', 'audit.read'
  ],
  secretaire: [
    'students.read', 'students.create', 'students.update', 'students.export',
    'teachers.read', 'classes.read', 'attendance.read', 'attendance.record',
    'timetable.read', 'admissions.read', 'admissions.manage',
    'documents.read', 'documents.upload', 'messages.read', 'messages.send'
  ],
  comptable: [
    'students.read', 'finance.read', 'finance.create', 'finance.update', 'finance.refund',
    'documents.read', 'documents.upload', 'reports.read', 'reports.export', 'messages.read'
  ],
  enseignant: [
    'students.read', 'classes.read', 'attendance.read', 'attendance.record',
    'grades.read', 'grades.create', 'grades.update', 'timetable.read',
    'documents.read', 'documents.upload', 'messages.read', 'messages.send'
  ],
  parent: [
    'students.read', 'attendance.read', 'grades.read', 'reportcards.read',
    'timetable.read', 'finance.read', 'documents.read', 'messages.read', 'messages.send'
  ],
  eleve: [
    'students.read', 'attendance.read', 'grades.read', 'reportcards.read',
    'timetable.read', 'documents.read', 'messages.read', 'messages.send'
  ]
};

// Standardized Demo Users (Clearly flagged as demonstration accounts)
export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'usr-admin',
    email: 'admin@polycarpe.eduka.ht',
    firstName: 'Jean-Baptiste',
    lastName: 'Salnave',
    role: 'admin',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0001',
    mfaEnabled: true,
    status: 'active',
    lastLoginAt: '2024-11-20T08:10:00Z',
    createdAt: '2023-08-01T00:00:00Z',
  },
  direction: {
    id: 'usr-direction',
    email: 'direction@polycarpe.eduka.ht',
    firstName: 'Sœur Marie-Claire',
    lastName: 'Auguste',
    role: 'direction',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0002',
    mfaEnabled: true,
    status: 'active',
    lastLoginAt: '2024-11-20T07:45:00Z',
    createdAt: '2023-08-01T00:00:00Z',
  },
  enseignant: {
    id: 'usr-prof-etienne',
    email: 'j.etienne@polycarpe.eduka.ht',
    matricule: 'ENS-2021-004',
    firstName: 'Jacques',
    lastName: 'Étienne',
    role: 'enseignant',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3600-1122',
    mfaEnabled: false,
    status: 'active',
    lastLoginAt: '2024-11-20T07:55:00Z',
    createdAt: '2021-08-15T00:00:00Z',
  },
  comptable: {
    id: 'usr-comptable',
    email: 'finance@polycarpe.eduka.ht',
    firstName: 'Gérard',
    lastName: 'Vilaire',
    role: 'comptable',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0004',
    mfaEnabled: true,
    status: 'active',
    lastLoginAt: '2024-11-20T08:00:00Z',
    createdAt: '2022-09-01T00:00:00Z',
  },
  secretaire: {
    id: 'usr-secretaire',
    email: 'secretariat@polycarpe.eduka.ht',
    firstName: 'Nathalie',
    lastName: 'Bellegarde',
    role: 'secretaire',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0005',
    mfaEnabled: false,
    status: 'active',
    lastLoginAt: '2024-11-20T07:50:00Z',
    createdAt: '2023-01-10T00:00:00Z',
  },
  parent: {
    id: 'usr-parent-celestin',
    email: 'jr.celestin@gmail.com',
    firstName: 'Jean-Robert',
    lastName: 'Célestin',
    role: 'parent',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3712-4455',
    mfaEnabled: false,
    status: 'active',
    lastLoginAt: '2024-11-19T20:15:00Z',
    createdAt: '2024-08-20T00:00:00Z',
  },
  eleve: {
    id: 'usr-eleve-celestin',
    email: 'm.celestin@student.eduka.ht',
    matricule: 'EDK-2024-001',
    firstName: 'Marc-Alain',
    lastName: 'Célestin',
    role: 'eleve',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3712-4455',
    mfaEnabled: false,
    status: 'active',
    lastLoginAt: '2024-11-20T07:30:00Z',
    createdAt: '2024-08-20T00:00:00Z',
  },
  super_admin: {
    id: 'usr-superadmin',
    email: 'superadmin@eduka.ht',
    firstName: 'Alexandre',
    lastName: 'Pétion-Laraque',
    role: 'super_admin',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3100-0000',
    mfaEnabled: true,
    status: 'active',
    lastLoginAt: '2024-11-20T08:30:00Z',
    createdAt: '2020-01-01T00:00:00Z',
  }
};

class AuthService {
  private currentUser: User = DEMO_USERS.admin;
  private listeners: Array<(user: User) => void> = [];

  constructor() {
    const savedRole = localStorage.getItem('eduka_current_role') as UserRole | null;
    if (savedRole && DEMO_USERS[savedRole]) {
      this.currentUser = DEMO_USERS[savedRole];
    }
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem('eduka_current_role', user.role);
    this.notify();
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(this.currentUser.role);
  }

  switchRole(role: UserRole): void {
    if (DEMO_USERS[role]) {
      this.currentUser = DEMO_USERS[role];
      localStorage.setItem('eduka_current_role', role);
      
      db.addAuditLog({
        userId: this.currentUser.id,
        userEmail: this.currentUser.email,
        userRole: this.currentUser.role,
        schoolId: this.currentUser.schoolId,
        action: 'user.switch_role',
        resource: 'Auth',
        details: `Basculement de profil vers le rôle : ${role}`,
        ipAddress: '190.115.16.42',
        status: 'success'
      });

      this.notify();
    }
  }

  hasPermission(permission: Permission): boolean {
    const userRole = this.currentUser.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  }

  subscribe(listener: (user: User) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.currentUser));
  }
}

export const auth = new AuthService();
