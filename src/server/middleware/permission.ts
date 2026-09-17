import { Request, Response, NextFunction } from 'express';

const ROLE_PERMISSIONS: Record<string, string[]> = {
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

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentification requise.' } });
      return;
    }

    const userRole = req.user.role;
    const allowedPermissions = ROLE_PERMISSIONS[userRole] || [];

    if (!allowedPermissions.includes(permission)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Permission refusée: '${permission}' est requis pour cette action.`,
        },
      });
      return;
    }

    next();
  };
}

export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentification requise.' } });
    return;
  }

  // School tenant constraint
  const requestedSchoolId = (req.params.schoolId || req.query.schoolId || req.body.schoolId) as string | undefined;

  if (requestedSchoolId && req.user.role !== 'super_admin' && requestedSchoolId !== req.user.schoolId) {
    res.status(403).json({
      error: {
        code: 'CROSS_TENANT_VIOLATION',
        message: 'Accès inter-établissement interdit. Violation de tenant détectée.',
      },
    });
    return;
  }

  next();
}
