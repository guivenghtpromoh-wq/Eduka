/**
 * EDUKA - Enterprise School Management Platform
 * Core TypeScript Definitions & Domain Models
 */

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'direction'
  | 'secretaire'
  | 'comptable'
  | 'enseignant'
  | 'parent'
  | 'eleve';

export type Currency = 'HTG' | 'USD';
export type PaymentMethod = 'cash' | 'moncash' | 'natcash' | 'bank_transfer' | 'card';
export type Payment = PaymentTransaction;
export type DocumentCategory = 'administratif' | 'bulletins' | 'certificats' | 'recus' | 'cours' | 'certificat' | 'reglement' | 'bulletin' | 'attestation';
export type AdmissionStatus = 'brouillon' | 'en_attente' | 'documents_requis' | 'validee' | 'refusee' | 'pending' | 'accepted' | 'enrolled';
export type ChannelType = 'in_app' | 'sms' | 'whatsapp' | 'email';

export interface CommunicationAnnouncement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  channel: ChannelType;
  targetRole: string;
  createdAt: string;
  isUrgent: boolean;
  recipientCount: number;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  startTime: string;
  endTime: string;
}

export type Permission =
  | 'students.read'
  | 'students.create'
  | 'students.update'
  | 'students.archive'
  | 'students.export'
  | 'teachers.read'
  | 'teachers.manage'
  | 'classes.read'
  | 'classes.manage'
  | 'attendance.read'
  | 'attendance.record'
  | 'grades.read'
  | 'grades.create'
  | 'grades.update'
  | 'grades.validate'
  | 'reportcards.read'
  | 'reportcards.generate'
  | 'reportcards.validate'
  | 'timetable.read'
  | 'timetable.manage'
  | 'admissions.read'
  | 'admissions.manage'
  | 'finance.read'
  | 'finance.create'
  | 'finance.update'
  | 'finance.refund'
  | 'documents.read'
  | 'documents.upload'
  | 'documents.delete'
  | 'messages.read'
  | 'messages.send'
  | 'reports.read'
  | 'reports.export'
  | 'security.read'
  | 'security.manage'
  | 'settings.read'
  | 'settings.update'
  | 'audit.read';

export interface User {
  id: string;
  email: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  schoolId: string;
  avatarUrl?: string;
  phone?: string;
  mfaEnabled: boolean;
  status: 'active' | 'suspended' | 'locked';
  lastLoginAt?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  country: string;
  logoUrl?: string;
}

export interface School {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  defaultCurrency: 'HTG' | 'USD';
  exchangeRateUsdToHtg: number; // e.g. 132.5
  currentAcademicYearId: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2024-2025"
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'archived';
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  coefficient: number;
  level: string; // e.g. "Fondamentale", "Secondaire"
  category: 'Scientifique' | 'Littéraire' | 'Sciences Humaines' | 'Langues' | 'Autre';
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string; // e.g. "9ème Année Fondamentale A"
  level: string; // e.g. "9ème AF", "NS1", "NS2", "Philo"
  section: string; // "A", "B"
  room: string;
  capacity: number;
  mainTeacherId: string;
  mainTeacherName?: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  schoolId: string;
  organizationId: string;
  matricule: string; // unique institutional ID
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  address: string;
  phone?: string;
  email?: string;
  currentClassId: string;
  className?: string;
  academicYearId: string;
  status: 'active' | 'inactive' | 'archived';
  bloodGroup?: string;
  medicalNotes?: string;
  parentIds: string[];
  photoUrl?: string;
  admissionDate: string;
  scholarshipRate?: number; // 0 to 100%
  createdAt: string;
}

export interface Parent {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  relationship: 'Père' | 'Mère' | 'Tuteur légal';
  phone: string;
  email: string;
  profession?: string;
  address: string;
  studentIds: string[];
}

export interface Teacher {
  id: string;
  schoolId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  qualification?: string;
  weeklyHours?: number;
  assignedClassIds: string[];
  assignedSubjectIds: string[];
  status: 'active' | 'on_leave';
  hireDate: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  period: 'morning' | 'afternoon' | 'full_day';
  status: AttendanceStatus;
  lateMinutes?: number;
  justificationReason?: string;
  recordedByUserId: string;
  recordedAt: string;
  synced: boolean;
}

export type AssessmentType = 'devoir' | 'controle' | 'examen' | 'projet' | 'participation';

export interface Assessment {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  type: AssessmentType;
  maxScore: number;
  weight: number; // coefficient
  period: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3' | 'Semestre 1' | 'Semestre 2';
  date: string;
  status: 'draft' | 'validated' | 'locked';
  academicYearId: string;
  createdById: string;
}

export interface Grade {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number; // e.g. 85 / 100
  comment?: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

export interface ReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  studentMatricule: string;
  studentName: string;
  classId: string;
  className: string;
  academicYearId: string;
  period: string;
  subjectGrades: {
    subjectId: string;
    subjectName: string;
    coefficient: number;
    score: number; // on 100 or 20
    weightedScore: number;
    classAverage: number;
    appreciation: string;
  }[];
  generalAverage: number;
  classRank: number;
  totalStudentsInClass: number;
  conductScore?: string;
  absencesCount: number;
  latesCount: number;
  appreciationPrincipal: string;
  decision: 'Admis' | 'Ajourné' | 'Tableau d\'Honneur' | 'Félicitations' | 'En attente';
  validated: boolean;
  validatedAt?: string;
  validatedBy?: string;
}

export interface TimetableEntry {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1=Lundi, 5=Vendredi
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "09:30"
  room: string;
}

export interface AdmissionApplication {
  id: string;
  schoolId: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  candidateName?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  targetClassLevel?: string;
  targetClass?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: AdmissionStatus;
  submittedAt?: string;
  submittedDate?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface FeeItem {
  id: string;
  schoolId: string;
  name: string; // e.g. "Scolarité Annuelle", "Frais d'Inscription", "Uniforme"
  amount: number;
  currency: 'HTG' | 'USD';
  dueFrequency: 'annual' | 'trimester' | 'monthly' | 'once';
  applicableLevel?: string;
}

export interface Invoice {
  id: string;
  schoolId: string;
  invoiceNumber: string; // e.g. "FAC-2024-00124"
  studentId: string;
  studentName: string;
  studentMatricule: string;
  academicYearId: string;
  title: string;
  totalAmount: number;
  discountAmount: number;
  netAmountDue: number;
  amountPaid: number;
  balanceRemaining: number;
  currency: 'HTG' | 'USD';
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  dueDate: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  schoolId: string;
  invoiceId: string;
  receiptNumber: string; // e.g. "REC-2024-00432"
  studentId: string;
  studentName: string;
  amount: number;
  currency: 'HTG' | 'USD';
  paymentMethod: 'cash' | 'moncash' | 'natcash' | 'bank_transfer' | 'card';
  referenceNumber: string;
  paidAt: string;
  receivedByUserId: string;
  notes?: string;
}

export interface SchoolDocument {
  id: string;
  schoolId: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number | string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  studentName?: string;
  targetRole?: UserRole | 'all';
  targetClassId?: string;
  fileUrl: string;
}

export type ChatMessageType = 'text' | 'voice' | 'image' | 'note';

export interface ChatNoteData {
  title: string;
  subject?: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  type: ChatMessageType;
  content: string;
  mediaUrl?: string; // base64 or blob URL for voice/image
  duration?: number; // audio duration in seconds
  noteData?: ChatNoteData;
  sentAt: string;
  readBy: string[];
}

export interface ChatConversation {
  id: string;
  schoolId: string;
  type: 'direct' | 'group';
  title?: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  classId?: string; // if tied to a class (e.g. NS1-A)
  className?: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
  requestedBy?: string; // in case of a 1-on-1 pending request
  isGroup: boolean;
  avatarColor?: string;
  lastMessage?: {
    content: string;
    sentAt: string;
    senderName: string;
    type: ChatMessageType;
  };
}

export interface MessageRequest {
  id: string;
  schoolId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserName: string;
  toUserRole: UserRole;
  classId: string;
  className: string;
  initialMessage: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface MessageItem {
  id: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string;
  targetGroup?: 'all' | 'teachers' | 'parents' | 'class';
  targetClassId?: string;
  subject: string;
  content: string;
  sentAt: string;
  readBy: string[];
  channel: 'in_app' | 'sms' | 'whatsapp' | 'email';
}

export interface Assignment {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  submissionsCount?: number;
}

export interface SchoolEvent {
  id: string;
  schoolId: string;
  title: string;
  type: 'examen' | 'reunion' | 'vacances' | 'activite' | 'pedagogique';
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  schoolId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
}

export interface SyncOperation {
  id: string;
  type: 'attendance_record' | 'grade_entry' | 'student_create' | 'payment_record' | 'assignment_create';
  timestamp: string;
  deviceId: string;
  userId: string;
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  errorDetails?: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActiveAt: string;
  isCurrent: boolean;
}
