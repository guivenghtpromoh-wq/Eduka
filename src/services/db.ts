/**
 * EDUKA - Enterprise Relational Storage & Data Engine
 * Supports Multi-Tenant Organizations, Academic Structure, Financials, and Offline Persistence.
 */

import {
  Organization,
  School,
  AcademicYear,
  SchoolClass,
  Subject,
  Student,
  Teacher,
  Parent,
  AttendanceRecord,
  Assessment,
  Grade,
  ReportCard,
  TimetableEntry,
  AdmissionApplication,
  FeeItem,
  Invoice,
  PaymentTransaction,
  SchoolDocument,
  MessageItem,
  Assignment,
  SchoolEvent,
  AuditLog,
  SyncOperation,
  ActiveSession,
  CommunicationAnnouncement,
  TimetableSlot,
  ChatMessage,
  ChatConversation,
  MessageRequest
} from '../types';

const STORAGE_PREFIX = 'eduka_enterprise_';

// Initial institutional seeds
const DEFAULT_ORGANIZATION: Organization = {
  id: 'org-saint-marc',
  name: 'Réseau Éducatif d\'Excellence Caraïbe',
  code: 'REEC',
  country: 'Haïti',
};

const DEFAULT_SCHOOLS: School[] = [
  {
    id: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    name: 'Institution Mixte Frère Polycarpe',
    code: 'IMFP',
    address: '42, Boulevard Jean-Jacques Dessalines',
    city: 'Port-au-Prince',
    country: 'Haïti',
    phone: '+509 2813-4400',
    email: 'direction@polycarpe.eduka.ht',
    defaultCurrency: 'HTG',
    exchangeRateUsdToHtg: 132.5,
    currentAcademicYearId: 'year-2024-2025',
  },
  {
    id: 'school-delmas',
    organizationId: 'org-saint-marc',
    name: 'Collège Moderne de Delmas',
    code: 'CMD',
    address: '15, Rue Charlemagne Péralte, Delmas 75',
    city: 'Delmas',
    country: 'Haïti',
    phone: '+509 2940-1122',
    email: 'contact@collegedelmas.eduka.ht',
    defaultCurrency: 'HTG',
    exchangeRateUsdToHtg: 132.5,
    currentAcademicYearId: 'year-2024-2025',
  },
  {
    id: 'school-cap',
    organizationId: 'org-saint-marc',
    name: 'Académie Saint-Louis du Nord',
    code: 'ASLN',
    address: '88, Rue 18 A, Boulevard du Bord de Mer',
    city: 'Cap-Haïtien',
    country: 'Haïti',
    phone: '+509 2262-9900',
    email: 'info@academiesaintlouis.eduka.ht',
    defaultCurrency: 'USD',
    exchangeRateUsdToHtg: 132.5,
    currentAcademicYearId: 'year-2024-2025',
  }
];

const DEFAULT_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'year-2024-2025',
    schoolId: 'school-polycarpe',
    name: '2024-2025',
    startDate: '2024-09-02',
    endDate: '2025-06-27',
    status: 'active',
  },
  {
    id: 'year-2023-2024',
    schoolId: 'school-polycarpe',
    name: '2023-2024',
    startDate: '2023-09-04',
    endDate: '2024-06-28',
    status: 'closed',
  }
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-math', schoolId: 'school-polycarpe', name: 'Mathématiques & Algèbre', code: 'MATH', coefficient: 5, level: 'Secondaire', category: 'Scientifique' },
  { id: 'sub-phy', schoolId: 'school-polycarpe', name: 'Sciences Physiques & Chimie', code: 'PC', coefficient: 4, level: 'Secondaire', category: 'Scientifique' },
  { id: 'sub-fra', schoolId: 'school-polycarpe', name: 'Français & Littérature', code: 'FRAN', coefficient: 4, level: 'Secondaire', category: 'Littéraire' },
  { id: 'sub-kreyol', schoolId: 'school-polycarpe', name: 'Kreyòl Ayisyen & Kilti', code: 'KREY', coefficient: 3, level: 'Secondaire', category: 'Langues' },
  { id: 'sub-ang', schoolId: 'school-polycarpe', name: 'Anglais Professionnel', code: 'ANG', coefficient: 2, level: 'Secondaire', category: 'Langues' },
  { id: 'sub-svt', schoolId: 'school-polycarpe', name: 'Sciences de la Vie & Terre', code: 'SVT', coefficient: 3, level: 'Secondaire', category: 'Scientifique' },
  { id: 'sub-hg', schoolId: 'school-polycarpe', name: 'Histoire & Géographie d\'Haïti', code: 'HIST-GEO', coefficient: 3, level: 'Secondaire', category: 'Sciences Humaines' },
  { id: 'sub-info', schoolId: 'school-polycarpe', name: 'Informatique & Algorithmique', code: 'INFO', coefficient: 2, level: 'Secondaire', category: 'Scientifique' },
];

const DEFAULT_CLASSES: SchoolClass[] = [
  {
    id: 'class-9af-a',
    schoolId: 'school-polycarpe',
    academicYearId: 'year-2024-2025',
    name: '9ème Année Fondamentale (9AF-A)',
    level: '9ème AF',
    section: 'A',
    room: 'Salle 103 - Bâtiment B',
    capacity: 35,
    mainTeacherId: 'tch-001',
    mainTeacherName: 'Prof. Jacques Étienne',
    studentCount: 28,
  },
  {
    id: 'class-ns1-a',
    schoolId: 'school-polycarpe',
    academicYearId: 'year-2024-2025',
    name: 'Nouveau Secondaire 1 (NS1-A)',
    level: 'NS1',
    section: 'A',
    room: 'Salle 201 - Bâtiment A',
    capacity: 30,
    mainTeacherId: 'tch-002',
    mainTeacherName: 'Prof. Marie-Laure Moïse',
    studentCount: 26,
  },
  {
    id: 'class-ns2-b',
    schoolId: 'school-polycarpe',
    academicYearId: 'year-2024-2025',
    name: 'Nouveau Secondaire 2 (NS2-B)',
    level: 'NS2',
    section: 'B',
    room: 'Salle 204 - Bâtiment A',
    capacity: 28,
    mainTeacherId: 'tch-003',
    mainTeacherName: 'Prof. Jean-Claude Pierre',
    studentCount: 24,
  },
  {
    id: 'class-ns4-philo',
    schoolId: 'school-polycarpe',
    academicYearId: 'year-2024-2025',
    name: 'Nouveau Secondaire 4 (NS4 Philo)',
    level: 'NS4',
    section: 'Unique',
    room: 'Salle 301 - Amphithéâtre Dessalines',
    capacity: 35,
    mainTeacherId: 'tch-001',
    mainTeacherName: 'Prof. Jacques Étienne',
    studentCount: 22,
  }
];

const DEFAULT_PARENTS: Parent[] = [
  {
    id: 'par-001',
    schoolId: 'school-polycarpe',
    firstName: 'Jean-Robert',
    lastName: 'Célestin',
    relationship: 'Père',
    phone: '+509 3712-4455',
    email: 'jr.celestin@gmail.com',
    profession: 'Ingénieur civil',
    address: 'Delmas 75, Impasse Bellevue #12',
    studentIds: ['stu-001', 'stu-002'],
  },
  {
    id: 'par-002',
    schoolId: 'school-polycarpe',
    firstName: 'Fabienne',
    lastName: 'Dauphin',
    relationship: 'Mère',
    phone: '+509 3820-9988',
    email: 'f.dauphin@yahoo.com',
    profession: 'Pharmacienne',
    address: 'Pétion-Ville, Route de Kenscoff #45',
    studentIds: ['stu-003'],
  }
];

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'tch-001',
    schoolId: 'school-polycarpe',
    matricule: 'ENS-2021-004',
    firstName: 'Jacques',
    lastName: 'Étienne',
    email: 'j.etienne@polycarpe.eduka.ht',
    phone: '+509 3600-1122',
    specialty: 'Mathématiques & Physique',
    assignedClassIds: ['class-9af-a', 'class-ns4-philo'],
    assignedSubjectIds: ['sub-math', 'sub-phy'],
    status: 'active',
    hireDate: '2021-08-15',
  },
  {
    id: 'tch-002',
    schoolId: 'school-polycarpe',
    matricule: 'ENS-2022-012',
    firstName: 'Marie-Laure',
    lastName: 'Moïse',
    email: 'ml.moise@polycarpe.eduka.ht',
    phone: '+509 3755-9090',
    specialty: 'Lettres & Langues',
    assignedClassIds: ['class-ns1-a', 'class-9af-a'],
    assignedSubjectIds: ['sub-fra', 'sub-kreyol'],
    status: 'active',
    hireDate: '2022-09-01',
  },
  {
    id: 'tch-003',
    schoolId: 'school-polycarpe',
    matricule: 'ENS-2020-002',
    firstName: 'Jean-Claude',
    lastName: 'Pierre',
    email: 'jc.pierre@polycarpe.eduka.ht',
    phone: '+509 3410-6789',
    specialty: 'Sciences Naturelles & Chimie',
    assignedClassIds: ['class-ns2-b', 'class-ns4-philo'],
    assignedSubjectIds: ['sub-svt', 'sub-phy'],
    status: 'active',
    hireDate: '2020-07-20',
  }
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'stu-001',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-001',
    firstName: 'Marc-Alain',
    lastName: 'Célestin',
    gender: 'M',
    birthDate: '2008-05-14',
    birthPlace: 'Port-au-Prince',
    address: 'Delmas 75, Impasse Bellevue #12',
    phone: '+509 3712-4455',
    email: 'm.celestin@student.eduka.ht',
    currentClassId: 'class-ns1-a',
    className: 'Nouveau Secondaire 1 (NS1-A)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'O+',
    medicalNotes: 'Aucune allergie connue',
    parentIds: ['par-001'],
    admissionDate: '2024-09-02',
    scholarshipRate: 0,
    createdAt: '2024-08-20T10:00:00Z',
  },
  {
    id: 'stu-002',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-002',
    firstName: 'Naomie',
    lastName: 'Célestin',
    gender: 'F',
    birthDate: '2010-09-22',
    birthPlace: 'Pétion-Ville',
    address: 'Delmas 75, Impasse Bellevue #12',
    phone: '+509 3712-4455',
    email: 'n.celestin@student.eduka.ht',
    currentClassId: 'class-9af-a',
    className: '9ème Année Fondamentale (9AF-A)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'B+',
    parentIds: ['par-001'],
    admissionDate: '2024-09-02',
    scholarshipRate: 15,
    createdAt: '2024-08-20T10:30:00Z',
  },
  {
    id: 'stu-003',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-003',
    firstName: 'Samuel',
    lastName: 'Dauphin',
    gender: 'M',
    birthDate: '2007-02-18',
    birthPlace: 'Port-au-Prince',
    address: 'Pétion-Ville, Route de Kenscoff #45',
    phone: '+509 3820-9988',
    email: 's.dauphin@student.eduka.ht',
    currentClassId: 'class-ns4-philo',
    className: 'Nouveau Secondaire 4 (NS4 Philo)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'A+',
    parentIds: ['par-002'],
    admissionDate: '2023-09-04',
    scholarshipRate: 0,
    createdAt: '2023-08-15T09:00:00Z',
  },
  {
    id: 'stu-004',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-004',
    firstName: 'Esther',
    lastName: 'Bélizaire',
    gender: 'F',
    birthDate: '2008-11-04',
    birthPlace: 'Cap-Haïtien',
    address: 'Bourdon, Ruelle Nazon #5',
    currentClassId: 'class-ns1-a',
    className: 'Nouveau Secondaire 1 (NS1-A)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'AB+',
    parentIds: [],
    admissionDate: '2024-09-02',
    scholarshipRate: 50, // Excellence academic scholarship
    createdAt: '2024-08-22T14:00:00Z',
  },
  {
    id: 'stu-005',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-005',
    firstName: 'Davidson',
    lastName: 'François',
    gender: 'M',
    birthDate: '2009-07-12',
    birthPlace: 'Carrefour',
    address: 'Canapé-Vert, Avenue des Damiers #3',
    currentClassId: 'class-ns2-b',
    className: 'Nouveau Secondaire 2 (NS2-B)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'O+',
    parentIds: [],
    admissionDate: '2024-09-02',
    scholarshipRate: 0,
    createdAt: '2024-08-25T11:00:00Z',
  },
  {
    id: 'stu-006',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-006',
    firstName: 'Jean-Marc',
    lastName: 'Dorval',
    gender: 'M',
    birthDate: '2008-08-19',
    birthPlace: 'Port-au-Prince',
    address: 'Delmas 33, Rue Charlemagne #8',
    phone: '+509 3744-2211',
    email: 'jm.dorval@student.eduka.ht',
    currentClassId: 'class-ns1-a',
    className: 'Nouveau Secondaire 1 (NS1-A)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'B+',
    parentIds: [],
    admissionDate: '2024-09-02',
    scholarshipRate: 0,
    createdAt: '2024-08-26T09:00:00Z',
  },
  {
    id: 'stu-007',
    schoolId: 'school-polycarpe',
    organizationId: 'org-saint-marc',
    matricule: 'EDK-2024-007',
    firstName: 'Widline',
    lastName: 'Joseph',
    gender: 'F',
    birthDate: '2008-03-30',
    birthPlace: 'Léogâne',
    address: 'Delmas 60, Rue Alerte #14',
    phone: '+509 3699-5500',
    email: 'w.joseph@student.eduka.ht',
    currentClassId: 'class-ns1-a',
    className: 'Nouveau Secondaire 1 (NS1-A)',
    academicYearId: 'year-2024-2025',
    status: 'active',
    bloodGroup: 'A+',
    parentIds: [],
    admissionDate: '2024-09-02',
    scholarshipRate: 25,
    createdAt: '2024-08-27T10:00:00Z',
  }
];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    studentId: 'stu-001',
    studentName: 'Marc-Alain Célestin',
    date: new Date().toISOString().split('T')[0],
    period: 'morning',
    status: 'present',
    recordedByUserId: 'usr-prof-etienne',
    recordedAt: new Date().toISOString(),
    synced: true,
  },
  {
    id: 'att-002',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    studentId: 'stu-004',
    studentName: 'Esther Bélizaire',
    date: new Date().toISOString().split('T')[0],
    period: 'morning',
    status: 'late',
    lateMinutes: 15,
    justificationReason: 'Embouteillage sur la route de Bourdon',
    recordedByUserId: 'usr-prof-etienne',
    recordedAt: new Date().toISOString(),
    synced: true,
  },
  {
    id: 'att-003',
    schoolId: 'school-polycarpe',
    classId: 'class-ns4-philo',
    studentId: 'stu-003',
    studentName: 'Samuel Dauphin',
    date: new Date().toISOString().split('T')[0],
    period: 'morning',
    status: 'present',
    recordedByUserId: 'usr-prof-etienne',
    recordedAt: new Date().toISOString(),
    synced: true,
  }
];

const DEFAULT_ASSESSMENTS: Assessment[] = [
  {
    id: 'ass-001',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    subjectId: 'sub-math',
    subjectName: 'Mathématiques & Algèbre',
    title: 'Contrôle #1 : Fonctions et Polynômes',
    type: 'controle',
    maxScore: 100,
    weight: 2,
    period: 'Trimestre 1',
    date: '2024-10-15',
    status: 'validated',
    academicYearId: 'year-2024-2025',
    createdById: 'tch-001',
  },
  {
    id: 'ass-002',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    subjectId: 'sub-fra',
    subjectName: 'Français & Littérature',
    title: 'Dissertation : Analyse de Gouverneurs de la Rosée',
    type: 'devoir',
    maxScore: 100,
    weight: 1.5,
    period: 'Trimestre 1',
    date: '2024-10-22',
    status: 'validated',
    academicYearId: 'year-2024-2025',
    createdById: 'tch-002',
  },
  {
    id: 'ass-003',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    subjectId: 'sub-phy',
    subjectName: 'Sciences Physiques & Chimie',
    title: 'Examen de Synthèse du 1er Trimestre',
    type: 'examen',
    maxScore: 100,
    weight: 3,
    period: 'Trimestre 1',
    date: '2024-11-28',
    status: 'draft',
    academicYearId: 'year-2024-2025',
    createdById: 'tch-001',
  }
];

const DEFAULT_GRADES: Grade[] = [
  { id: 'grd-001', assessmentId: 'ass-001', studentId: 'stu-001', score: 88, comment: 'Très bonne maîtrise des équations.', isLocked: true, lockedAt: '2024-10-18T16:00:00Z', lockedBy: 'Prof. Jacques Étienne' },
  { id: 'grd-002', assessmentId: 'ass-001', studentId: 'stu-004', score: 94, comment: 'Excellent raisonnement mathématique.', isLocked: true, lockedAt: '2024-10-18T16:00:00Z', lockedBy: 'Prof. Jacques Étienne' },
  { id: 'grd-003', assessmentId: 'ass-002', studentId: 'stu-001', score: 82, comment: 'Analyse littéraire pertinente.', isLocked: true, lockedAt: '2024-10-25T14:00:00Z', lockedBy: 'Prof. Marie-Laure Moïse' },
  { id: 'grd-004', assessmentId: 'ass-002', studentId: 'stu-004', score: 91, comment: 'Style remarquable et argumentation claire.', isLocked: true, lockedAt: '2024-10-25T14:00:00Z', lockedBy: 'Prof. Marie-Laure Moïse' },
  { id: 'grd-005', assessmentId: 'ass-003', studentId: 'stu-001', score: 85, comment: 'Brouillon provisoire', isLocked: false },
  { id: 'grd-006', assessmentId: 'ass-003', studentId: 'stu-004', score: 92, comment: 'Brouillon provisoire', isLocked: false },
];

const DEFAULT_FEES: FeeItem[] = [
  { id: 'fee-inscr', schoolId: 'school-polycarpe', name: 'Frais d\'Inscription & Dossier', amount: 5000, currency: 'HTG', dueFrequency: 'once' },
  { id: 'fee-scol-ns', schoolId: 'school-polycarpe', name: 'Scolarité Annuelle Secondaire', amount: 65000, currency: 'HTG', dueFrequency: 'annual', applicableLevel: 'Secondaire' },
  { id: 'fee-scol-fond', schoolId: 'school-polycarpe', name: 'Scolarité Annuelle Fondamentale', amount: 52000, currency: 'HTG', dueFrequency: 'annual', applicableLevel: 'Fondamentale' },
  { id: 'fee-lab', schoolId: 'school-polycarpe', name: 'Frais de Laboratoire & Informatique', amount: 120, currency: 'USD', dueFrequency: 'annual' },
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-2024-001',
    schoolId: 'school-polycarpe',
    invoiceNumber: 'FAC-2024-00101',
    studentId: 'stu-001',
    studentName: 'Marc-Alain Célestin',
    studentMatricule: 'EDK-2024-001',
    academicYearId: 'year-2024-2025',
    title: 'Écolage Annuel 2024-2025 (NS1-A)',
    totalAmount: 65000,
    discountAmount: 0,
    netAmountDue: 65000,
    amountPaid: 45000,
    balanceRemaining: 20000,
    currency: 'HTG',
    status: 'partial',
    dueDate: '2025-01-15',
    createdAt: '2024-09-02T08:00:00Z',
  },
  {
    id: 'inv-2024-002',
    schoolId: 'school-polycarpe',
    invoiceNumber: 'FAC-2024-00102',
    studentId: 'stu-002',
    studentName: 'Naomie Célestin',
    studentMatricule: 'EDK-2024-002',
    academicYearId: 'year-2024-2025',
    title: 'Écolage Annuel 2024-2025 (9AF-A)',
    totalAmount: 52000,
    discountAmount: 7800, // 15% discount
    netAmountDue: 44200,
    amountPaid: 44200,
    balanceRemaining: 0,
    currency: 'HTG',
    status: 'paid',
    dueDate: '2024-11-30',
    createdAt: '2024-09-02T08:15:00Z',
  },
  {
    id: 'inv-2024-003',
    schoolId: 'school-polycarpe',
    invoiceNumber: 'FAC-2024-00103',
    studentId: 'stu-004',
    studentName: 'Esther Bélizaire',
    studentMatricule: 'EDK-2024-004',
    academicYearId: 'year-2024-2025',
    title: 'Écolage Annuel 2024-2025 (NS1-A)',
    totalAmount: 65000,
    discountAmount: 32500, // 50% scholarship
    netAmountDue: 32500,
    amountPaid: 15000,
    balanceRemaining: 17500,
    currency: 'HTG',
    status: 'partial',
    dueDate: '2025-02-15',
    createdAt: '2024-09-02T08:30:00Z',
  },
  {
    id: 'inv-2024-004',
    schoolId: 'school-polycarpe',
    invoiceNumber: 'FAC-2024-00104',
    studentId: 'stu-003',
    studentName: 'Samuel Dauphin',
    studentMatricule: 'EDK-2024-003',
    academicYearId: 'year-2024-2025',
    title: 'Frais de Laboratoire et Examens Baccalauréat',
    totalAmount: 120,
    discountAmount: 0,
    netAmountDue: 120,
    amountPaid: 120,
    balanceRemaining: 0,
    currency: 'USD',
    status: 'paid',
    dueDate: '2024-10-31',
    createdAt: '2024-09-05T09:00:00Z',
  }
];

const DEFAULT_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    schoolId: 'school-polycarpe',
    invoiceId: 'inv-2024-001',
    receiptNumber: 'REC-2024-00310',
    studentId: 'stu-001',
    studentName: 'Marc-Alain Célestin',
    amount: 25000,
    currency: 'HTG',
    paymentMethod: 'moncash',
    referenceNumber: 'MC-9988231',
    paidAt: '2024-09-05T11:20:00Z',
    receivedByUserId: 'usr-comptable',
    notes: '1er Versement écolage annuel via MonCash',
  },
  {
    id: 'pay-002',
    schoolId: 'school-polycarpe',
    invoiceId: 'inv-2024-001',
    receiptNumber: 'REC-2024-00455',
    studentId: 'stu-001',
    studentName: 'Marc-Alain Célestin',
    amount: 20000,
    currency: 'HTG',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'BNC-TRF-44120',
    paidAt: '2024-11-12T14:45:00Z',
    receivedByUserId: 'usr-comptable',
    notes: '2ème Versement par virement BNC',
  },
  {
    id: 'pay-003',
    schoolId: 'school-polycarpe',
    invoiceId: 'inv-2024-002',
    receiptNumber: 'REC-2024-00311',
    studentId: 'stu-002',
    studentName: 'Naomie Célestin',
    amount: 44200,
    currency: 'HTG',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'UNIBANK-009214',
    paidAt: '2024-09-06T10:00:00Z',
    receivedByUserId: 'usr-comptable',
    notes: 'Règlement intégral avec remise fratrie',
  }
];

const DEFAULT_TIMETABLE: TimetableEntry[] = [
  { id: 'tt-001', schoolId: 'school-polycarpe', classId: 'class-ns1-a', subjectId: 'sub-math', teacherId: 'tch-001', dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: 'Salle 201' },
  { id: 'tt-002', schoolId: 'school-polycarpe', classId: 'class-ns1-a', subjectId: 'sub-fra', teacherId: 'tch-002', dayOfWeek: 1, startTime: '10:15', endTime: '12:00', room: 'Salle 201' },
  { id: 'tt-003', schoolId: 'school-polycarpe', classId: 'class-ns1-a', subjectId: 'sub-phy', teacherId: 'tch-001', dayOfWeek: 2, startTime: '08:00', endTime: '09:45', room: 'Laboratoire Sciences' },
  { id: 'tt-004', schoolId: 'school-polycarpe', classId: 'class-ns1-a', subjectId: 'sub-kreyol', teacherId: 'tch-002', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'Salle 201' },
  { id: 'tt-005', schoolId: 'school-polycarpe', classId: 'class-ns1-a', subjectId: 'sub-info', teacherId: 'tch-001', dayOfWeek: 3, startTime: '08:00', endTime: '10:00', room: 'Salle Informatique' },
];

const DEFAULT_ADMISSIONS: AdmissionApplication[] = [
  {
    id: 'adm-001',
    schoolId: 'school-polycarpe',
    applicantFirstName: 'Junior',
    applicantLastName: 'Alexandre',
    birthDate: '2009-04-10',
    gender: 'M',
    targetClassLevel: 'NS1',
    parentName: 'Réginald Alexandre',
    parentPhone: '+509 3677-2211',
    parentEmail: 'r.alexandre@gmail.com',
    status: 'en_attente',
    submittedAt: '2024-08-10T14:30:00Z',
    notes: 'Dossier académique satisfaisant en 9ème AF, certificat en attente de visa.',
  },
  {
    id: 'adm-002',
    schoolId: 'school-polycarpe',
    applicantFirstName: 'Clara',
    applicantLastName: 'Saint-Fleur',
    birthDate: '2011-08-19',
    gender: 'F',
    targetClassLevel: '7ème AF',
    parentName: 'Marie Rose Saint-Fleur',
    parentPhone: '+509 3890-4433',
    parentEmail: 'mr.saintfleur@hotmail.com',
    status: 'validee',
    submittedAt: '2024-08-12T09:15:00Z',
    reviewedBy: 'M. le Secrétaire Général',
    notes: 'Test d\'admission réussi (84%). Affectation en 7AF-B.',
  }
];

const DEFAULT_DOCUMENTS: SchoolDocument[] = [
  {
    id: 'doc-001',
    schoolId: 'school-polycarpe',
    title: 'Règlement Intérieur et Charte de Discipline 2024-2025',
    category: 'administratif',
    fileName: 'Reglement_Interieur_IMFP_2024.pdf',
    fileSize: 452000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-08-25T10:00:00Z',
    uploadedBy: 'Direction Académique',
    targetRole: 'all',
    fileUrl: '#',
  },
  {
    id: 'doc-002',
    schoolId: 'school-polycarpe',
    title: 'Grille Tarifaire Officielle & Calendrier des Échéances',
    category: 'administratif',
    fileName: 'Grille_Frais_Scolaires_2024_2025.pdf',
    fileSize: 280000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-08-28T14:00:00Z',
    uploadedBy: 'Service Comptabilité',
    targetRole: 'parent',
    fileUrl: '#',
  },
  {
    id: 'doc-003',
    schoolId: 'school-polycarpe',
    title: 'Certificat de Scolarité Modèle Validé MENFP',
    category: 'certificats',
    fileName: 'Modele_Certificat_Scolarite_MENFP.pdf',
    fileSize: 185000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-09-01T11:30:00Z',
    uploadedBy: 'Secrétariat Général',
    targetRole: 'secretaire',
    fileUrl: '#',
  }
];

const DEFAULT_MESSAGES: MessageItem[] = [
  {
    id: 'msg-001',
    schoolId: 'school-polycarpe',
    senderId: 'usr-direction',
    senderName: 'Direction de l\'Établissement',
    senderRole: 'direction',
    targetGroup: 'all',
    subject: 'Rentrée Scolaire et consignes d\'assiduité',
    content: 'Chers parents, chers professeurs et élèves, nous vous souhaitons une fructueuse année académique 2024-2025. Le port de l\'uniforme complet et la ponctualité dès 7h45 sont strictement requis.',
    sentAt: '2024-09-02T07:00:00Z',
    readBy: ['usr-prof-etienne'],
    channel: 'in_app',
  },
  {
    id: 'msg-002',
    schoolId: 'school-polycarpe',
    senderId: 'usr-comptable',
    senderName: 'Service de Recouvrement',
    senderRole: 'comptable',
    targetGroup: 'parents',
    subject: 'Rappel : Échéance du 2ème Versement d\'Écolage',
    content: 'Nous informons les responsables d\'élèves que l\'échéance du deuxième versement est fixée au 15 Janvier 2025. Vous pouvez régler par virement bancaire ou via MonCash/NatCash au secrétariat.',
    sentAt: '2024-11-20T09:30:00Z',
    readBy: [],
    channel: 'sms',
  }
];

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-001',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    className: 'Nouveau Secondaire 1 (NS1-A)',
    subjectId: 'sub-math',
    subjectName: 'Mathématiques & Algèbre',
    teacherId: 'tch-001',
    teacherName: 'Prof. Jacques Étienne',
    title: 'Exercices 14 à 22 : Résolution d\'inéquations du second degré',
    description: 'À rédiger avec soin sur feuille double. Justifier chaque étape géométrique et algébrique.',
    dueDate: '2024-11-25',
    createdAt: '2024-11-18T10:00:00Z',
    submissionsCount: 24,
  },
  {
    id: 'asg-002',
    schoolId: 'school-polycarpe',
    classId: 'class-ns1-a',
    className: 'Nouveau Secondaire 1 (NS1-A)',
    subjectId: 'sub-fra',
    subjectName: 'Français & Littérature',
    teacherId: 'tch-002',
    teacherName: 'Prof. Marie-Laure Moïse',
    title: 'Commentaire composé : Extrait de Compère Général Soleil',
    description: 'Introduction complète, plan détaillé en deux parties et conclusion synthétique.',
    dueDate: '2024-11-29',
    createdAt: '2024-11-20T14:00:00Z',
    submissionsCount: 22,
  }
];

const DEFAULT_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-001',
    schoolId: 'school-polycarpe',
    title: 'Examens de Synthèse du Premier Trimestre',
    type: 'examen',
    startDate: '2024-12-09',
    endDate: '2024-12-13',
    location: 'Tous les campus',
    description: 'Évaluations institutionnelles bloquées le matin de 8h00 à 12h30.',
  },
  {
    id: 'evt-002',
    schoolId: 'school-polycarpe',
    title: 'Rencontre Parents-Professeurs & Remise des Bulletins',
    type: 'reunion',
    startDate: '2024-12-20',
    endDate: '2024-12-20',
    location: 'Auditorium Central',
    description: 'Bilan d\'étape académique et remise en mains propres des bulletins du premier trimestre.',
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: '2024-10-18T16:00:05Z',
    userId: 'usr-prof-etienne',
    userEmail: 'j.etienne@polycarpe.eduka.ht',
    userRole: 'enseignant',
    schoolId: 'school-polycarpe',
    action: 'grades.lock',
    resource: 'Assessment',
    resourceId: 'ass-001',
    details: 'Verrouillage officiel des notes pour le Contrôle #1 (NS1-A)',
    ipAddress: '190.115.16.42',
    status: 'success',
  },
  {
    id: 'aud-002',
    timestamp: '2024-11-12T14:45:22Z',
    userId: 'usr-comptable',
    userEmail: 'finance@polycarpe.eduka.ht',
    userRole: 'comptable',
    schoolId: 'school-polycarpe',
    action: 'finance.payment_recorded',
    resource: 'PaymentTransaction',
    resourceId: 'pay-002',
    details: 'Encaissement de 20,000 HTG (Reçu REC-2024-00455) pour Marc-Alain Célestin',
    ipAddress: '190.115.16.42',
    status: 'success',
  },
  {
    id: 'aud-003',
    timestamp: '2024-11-20T08:10:00Z',
    userId: 'usr-admin',
    userEmail: 'admin@polycarpe.eduka.ht',
    userRole: 'admin',
    schoolId: 'school-polycarpe',
    action: 'user.login_mfa',
    resource: 'Session',
    details: 'Connexion réussie avec validation OTP (MFA) depuis terminal Mac/Safari',
    ipAddress: '190.115.16.42',
    status: 'success',
  }
];

const DEFAULT_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-001',
    userId: 'usr-admin',
    deviceName: 'MacBook Pro 16" - Salle Direction',
    browser: 'Safari 18.2 / macOS Sonoma',
    ipAddress: '190.115.16.42',
    location: 'Port-au-Prince, HT',
    lastActiveAt: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: 'sess-002',
    userId: 'usr-admin',
    deviceName: 'Samsung Galaxy A54 5G - Mobile Direction',
    browser: 'EDUKA Mobile App / Android 14',
    ipAddress: '190.115.16.98',
    location: 'Delmas, HT',
    lastActiveAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isCurrent: false,
  }
];

class DatabaseEngine {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  // Organizations & Schools
  getOrganization(): Organization {
    return this.get<Organization>('organization', DEFAULT_ORGANIZATION);
  }

  getSchools(): School[] {
    return this.get<School[]>('schools', DEFAULT_SCHOOLS);
  }

  getCurrentSchoolId(): string {
    return this.get<string>('current_school_id', 'school-polycarpe');
  }

  setCurrentSchoolId(schoolId: string): void {
    this.set('current_school_id', schoolId);
  }

  getSchoolById(schoolId: string): School | undefined {
    return this.getSchools().find(s => s.id === schoolId);
  }

  updateSchool(school: School): void {
    const schools = this.getSchools().map(s => (s.id === school.id ? school : s));
    this.set('schools', schools);
  }

  // Academic Years
  getAcademicYears(schoolId?: string): AcademicYear[] {
    const list = this.get<AcademicYear[]>('academic_years', DEFAULT_ACADEMIC_YEARS);
    return schoolId ? list.filter(y => y.schoolId === schoolId) : list;
  }

  addAcademicYear(year: AcademicYear): void {
    const list = this.getAcademicYears();
    list.unshift(year);
    this.set('academic_years', list);
  }

  // Subjects
  getSubjects(schoolId?: string): Subject[] {
    const list = this.get<Subject[]>('subjects', DEFAULT_SUBJECTS);
    return schoolId ? list.filter(s => s.schoolId === schoolId) : list;
  }

  addSubject(subject: Subject): void {
    const list = this.getSubjects();
    list.push(subject);
    this.set('subjects', list);
  }

  // Classes
  getClasses(schoolId?: string): SchoolClass[] {
    const list = this.get<SchoolClass[]>('classes', DEFAULT_CLASSES);
    return schoolId ? list.filter(c => c.schoolId === schoolId) : list;
  }

  getClassById(classId: string): SchoolClass | undefined {
    return this.getClasses().find(c => c.id === classId);
  }

  addClass(cls: SchoolClass): void {
    const list = this.getClasses();
    list.push(cls);
    this.set('classes', list);
  }

  // Teachers
  getTeachers(schoolId?: string): Teacher[] {
    const list = this.get<Teacher[]>('teachers', DEFAULT_TEACHERS);
    return schoolId ? list.filter(t => t.schoolId === schoolId) : list;
  }

  addTeacher(teacher: Teacher): void {
    const list = this.getTeachers();
    list.push(teacher);
    this.set('teachers', list);
  }

  // Students
  getStudents(schoolId?: string): Student[] {
    const list = this.get<Student[]>('students', DEFAULT_STUDENTS);
    return schoolId ? list.filter(s => s.schoolId === schoolId) : list;
  }

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  addStudent(student: Student): void {
    const list = this.getStudents();
    list.unshift(student);
    this.set('students', list);
  }

  updateStudent(student: Student): void {
    const list = this.getStudents().map(s => (s.id === student.id ? student : s));
    this.set('students', list);
  }

  deleteStudent(studentId: string): void {
    const list = this.getStudents().filter(s => s.id !== studentId);
    this.set('students', list);
  }

  // Parents
  getParents(schoolId?: string): Parent[] {
    const list = this.get<Parent[]>('parents', DEFAULT_PARENTS);
    return schoolId ? list.filter(p => p.schoolId === schoolId) : list;
  }

  // Attendance
  getAttendance(schoolId?: string, classId?: string, date?: string): AttendanceRecord[] {
    let list = this.get<AttendanceRecord[]>('attendance', DEFAULT_ATTENDANCE);
    if (schoolId) list = list.filter(a => a.schoolId === schoolId);
    if (classId) list = list.filter(a => a.classId === classId);
    if (date) list = list.filter(a => a.date === date);
    return list;
  }

  saveAttendanceBatch(records: AttendanceRecord[]): void {
    const existing = this.get<AttendanceRecord[]>('attendance', DEFAULT_ATTENDANCE);
    // Replace or add
    const map = new Map(existing.map(r => [`${r.studentId}_${r.date}_${r.period}`, r]));
    records.forEach(r => map.set(`${r.studentId}_${r.date}_${r.period}`, r));
    this.set('attendance', Array.from(map.values()));
  }

  // Assessments & Grades
  getAssessments(schoolId?: string, classId?: string): Assessment[] {
    let list = this.get<Assessment[]>('assessments', DEFAULT_ASSESSMENTS);
    if (schoolId) list = list.filter(a => a.schoolId === schoolId);
    if (classId) list = list.filter(a => a.classId === classId);
    return list;
  }

  addAssessment(assessment: Assessment): void {
    const list = this.getAssessments();
    list.unshift(assessment);
    this.set('assessments', list);
  }

  getGrades(assessmentId?: string): Grade[] {
    let list = this.get<Grade[]>('grades', DEFAULT_GRADES);
    if (assessmentId) list = list.filter(g => g.assessmentId === assessmentId);
    return list;
  }

  saveGradesBatch(grades: Grade[]): void {
    const existing = this.get<Grade[]>('grades', DEFAULT_GRADES);
    const map = new Map(existing.map(g => [g.id, g]));
    grades.forEach(g => map.set(g.id, g));
    this.set('grades', Array.from(map.values()));
  }

  lockAssessmentGrades(assessmentId: string, lockedBy: string): void {
    const assessments = this.getAssessments().map(a => a.id === assessmentId ? { ...a, status: 'locked' as const } : a);
    this.set('assessments', assessments);

    const grades = this.getGrades().map(g => {
      if (g.assessmentId === assessmentId) {
        return {
          ...g,
          isLocked: true,
          lockedAt: new Date().toISOString(),
          lockedBy
        };
      }
      return g;
    });
    this.set('grades', grades);
  }

  // Invoices & Payments
  getInvoices(schoolId?: string): Invoice[] {
    const list = this.get<Invoice[]>('invoices', DEFAULT_INVOICES);
    return schoolId ? list.filter(i => i.schoolId === schoolId) : list;
  }

  addInvoice(invoice: Invoice): void {
    const list = this.getInvoices();
    list.unshift(invoice);
    this.set('invoices', list);
  }

  getPayments(schoolId?: string): PaymentTransaction[] {
    const list = this.get<PaymentTransaction[]>('payments', DEFAULT_PAYMENTS);
    return schoolId ? list.filter(p => p.schoolId === schoolId) : list;
  }

  addPayment(payment: PaymentTransaction): void {
    const list = this.getPayments();
    list.unshift(payment);
    this.set('payments', list);

    // Update invoice balance
    const invoices = this.getInvoices();
    const inv = invoices.find(i => i.id === payment.invoiceId);
    if (inv) {
      inv.amountPaid += payment.amount;
      inv.balanceRemaining = Math.max(0, inv.netAmountDue - inv.amountPaid);
      inv.status = inv.balanceRemaining === 0 ? 'paid' : 'partial';
      this.set('invoices', invoices);
    }
  }

  getFees(schoolId?: string): FeeItem[] {
    const list = this.get<FeeItem[]>('fees', DEFAULT_FEES);
    return schoolId ? list.filter(f => f.schoolId === schoolId) : list;
  }

  // Timetable
  getTimetable(schoolId?: string, classId?: string): TimetableEntry[] {
    let list = this.get<TimetableEntry[]>('timetable', DEFAULT_TIMETABLE);
    if (schoolId) list = list.filter(t => t.schoolId === schoolId);
    if (classId) list = list.filter(t => t.classId === classId);
    return list;
  }

  addTimetableEntry(entry: TimetableEntry): void {
    const list = this.getTimetable();
    list.push(entry);
    this.set('timetable', list);
  }

  // Admissions
  getAdmissions(schoolId?: string): AdmissionApplication[] {
    const list = this.get<AdmissionApplication[]>('admissions', DEFAULT_ADMISSIONS);
    return schoolId ? list.filter(a => a.schoolId === schoolId) : list;
  }

  addAdmission(admission: AdmissionApplication): void {
    const list = this.getAdmissions();
    list.unshift(admission);
    this.set('admissions', list);
  }

  updateAdmissionStatus(admissionId: string, status: AdmissionApplication['status'], reviewedBy?: string): void {
    const list = this.getAdmissions().map(a => a.id === admissionId ? { ...a, status, reviewedBy } : a);
    this.set('admissions', list);
  }

  // Documents
  getDocuments(schoolId?: string): SchoolDocument[] {
    const list = this.get<SchoolDocument[]>('documents', DEFAULT_DOCUMENTS);
    return schoolId ? list.filter(d => d.schoolId === schoolId) : list;
  }

  addDocument(doc: SchoolDocument): void {
    const list = this.getDocuments();
    list.unshift(doc);
    this.set('documents', list);
  }

  // Messages
  getMessages(schoolId?: string): MessageItem[] {
    const list = this.get<MessageItem[]>('messages', DEFAULT_MESSAGES);
    return schoolId ? list.filter(m => m.schoolId === schoolId) : list;
  }

  addMessage(msg: MessageItem): void {
    const list = this.getMessages();
    list.unshift(msg);
    this.set('messages', list);
  }

  // Assignments
  getAssignments(schoolId?: string, classId?: string): Assignment[] {
    let list = this.get<Assignment[]>('assignments', DEFAULT_ASSIGNMENTS);
    if (schoolId) list = list.filter(a => a.schoolId === schoolId);
    if (classId) list = list.filter(a => a.classId === classId);
    return list;
  }

  addAssignment(asg: Assignment): void {
    const list = this.getAssignments();
    list.unshift(asg);
    this.set('assignments', list);
  }

  // Events
  getEvents(schoolId?: string): SchoolEvent[] {
    const list = this.get<SchoolEvent[]>('events', DEFAULT_EVENTS);
    return schoolId ? list.filter(e => e.schoolId === schoolId) : list;
  }

  addEvent(event: SchoolEvent): void {
    const list = this.getEvents();
    list.unshift(event);
    this.set('events', list);
  }

  // Audit Logs (Append-Only)
  getAuditLogs(schoolId?: string): AuditLog[] {
    const list = this.get<AuditLog[]>('audit_logs', DEFAULT_AUDIT_LOGS);
    return schoolId ? list.filter(l => l.schoolId === schoolId) : list;
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const list = this.getAuditLogs();
    const entry: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(entry);
    this.set('audit_logs', list);
  }

  // Sessions
  getSessions(): ActiveSession[] {
    return this.get<ActiveSession[]>('sessions', DEFAULT_SESSIONS);
  }

  revokeSession(sessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    this.set('sessions', sessions);
  }

  revokeAllOtherSessions(currentSessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id === currentSessionId);
    this.set('sessions', sessions);
  }

  // Offline Sync Queue
  getSyncQueue(): SyncOperation[] {
    return this.get<SyncOperation[]>('sync_queue', []);
  }

  addSyncOperation(op: Omit<SyncOperation, 'id' | 'timestamp' | 'status'>): SyncOperation {
    const list = this.getSyncQueue();
    const item: SyncOperation = {
      ...op,
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    list.push(item);
    this.set('sync_queue', list);
    return item;
  }

  updateSyncOperation(id: string, status: SyncOperation['status'], errorDetails?: string): void {
    const list = this.getSyncQueue().map(s => s.id === id ? { ...s, status, errorDetails } : s);
    this.set('sync_queue', list);
  }

  clearSyncedOperations(): void {
    const list = this.getSyncQueue().filter(s => s.status !== 'synced');
    this.set('sync_queue', list);
  }

  updateInvoice(invoice: Invoice): void {
    const list = this.getInvoices().map(i => i.id === invoice.id ? invoice : i);
    this.set('invoices', list);
  }

  getAnnouncements(schoolId?: string): CommunicationAnnouncement[] {
    const defaultAnnouncements: CommunicationAnnouncement[] = [
      {
        id: 'ann-001',
        schoolId: 'school-polycarpe',
        title: 'Conseil Pédagogique du 1er Trimestre',
        content: 'La réunion plénière d\'harmonisation des barèmes d\'évaluation se tiendra ce vendredi à 14h00 en Salle des Professeurs.',
        authorName: 'Sœur Marie-Claire Auguste',
        authorRole: 'direction',
        channel: 'in_app',
        targetRole: 'teachers',
        createdAt: '2024-11-15T09:00:00Z',
        isUrgent: false,
        recipientCount: 38,
      },
      {
        id: 'ann-002',
        schoolId: 'school-polycarpe',
        title: 'Alerte Vigilance Météorologique - Forte pluie',
        content: 'Selon le bulletin de l\'UHM, de fortes averses orageuses sont prévues cet après-midi. Les sorties anticipées d\'élèves sont autorisées sous encadrement des parents.',
        authorName: 'Jean-Baptiste Salnave',
        authorRole: 'admin',
        channel: 'sms',
        targetRole: 'all',
        createdAt: '2024-11-18T11:30:00Z',
        isUrgent: true,
        recipientCount: 142,
      },
    ];
    const list = this.get<CommunicationAnnouncement[]>('announcements', defaultAnnouncements);
    return schoolId ? list.filter(a => a.schoolId === schoolId) : list;
  }

  addAnnouncement(ann: CommunicationAnnouncement): void {
    const list = this.getAnnouncements();
    list.unshift(ann);
    this.set('announcements', list);
  }

  getTimetableSlots(schoolId?: string): TimetableSlot[] {
    const defaultSlots: TimetableSlot[] = [
      {
        id: 'slot-1',
        schoolId: 'school-polycarpe',
        classId: 'class-ns1-a',
        subjectId: 'sub-math',
        subjectName: 'Mathématiques & Algèbre',
        teacherId: 'tch-001',
        teacherName: 'Prof. Jacques Étienne',
        room: 'Salle 201',
        day: 'Lundi',
        startTime: '08:00',
        endTime: '09:00'
      },
      {
        id: 'slot-2',
        schoolId: 'school-polycarpe',
        classId: 'class-ns1-a',
        subjectId: 'sub-phy',
        subjectName: 'Sciences Physiques',
        teacherId: 'tch-002',
        teacherName: 'Prof. Marie-Laure Moïse',
        room: 'Salle 201',
        day: 'Lundi',
        startTime: '09:00',
        endTime: '10:00'
      },
      {
        id: 'slot-3',
        schoolId: 'school-polycarpe',
        classId: 'class-ns1-a',
        subjectId: 'sub-fra',
        subjectName: 'Français & Littérature',
        teacherId: 'tch-003',
        teacherName: 'Prof. Jean-Claude Pierre',
        room: 'Salle 201',
        day: 'Mardi',
        startTime: '10:15',
        endTime: '11:15'
      }
    ];
    const list = this.get<TimetableSlot[]>('timetable_slots', defaultSlots);
    return schoolId ? list.filter(s => s.schoolId === schoolId) : list;
  }

  addTimetableSlot(slot: TimetableSlot): void {
    const list = this.getTimetableSlots();
    list.push(slot);
    this.set('timetable_slots', list);
  }

  getConversations(schoolId?: string, userId?: string): ChatConversation[] {
    const defaultConversations: ChatConversation[] = [
      {
        id: 'conv-ns1-official',
        schoolId: 'school-polycarpe',
        type: 'group',
        title: 'Salon de Classe Officiel : NS1-A',
        participantIds: ['usr-eleve-celestin', 'usr-prof-etienne', 'usr-eleve-belizaire', 'usr-eleve-dorval', 'usr-eleve-joseph'],
        participantNames: {
          'usr-eleve-celestin': 'Marc-Alain Célestin',
          'usr-prof-etienne': 'Prof. Jacques Étienne',
          'usr-eleve-belizaire': 'Esther Bélizaire',
          'usr-eleve-dorval': 'Jean-Marc Dorval',
          'usr-eleve-joseph': 'Widline Joseph'
        },
        classId: 'class-ns1-a',
        className: 'Nouveau Secondaire 1 (NS1-A)',
        createdBy: 'usr-prof-etienne',
        createdAt: '2024-09-05T08:00:00Z',
        status: 'active',
        isGroup: true,
        avatarColor: '#075B46',
        lastMessage: {
          content: 'N\'oubliez pas le devoir de mathématiques pour jeudi matin !',
          sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          senderName: 'Prof. Jacques Étienne',
          type: 'text'
        }
      },
      {
        id: 'conv-etude-math-ns1',
        schoolId: 'school-polycarpe',
        type: 'group',
        title: 'Gwoup Etid Matematik & Fizik (NS1-A)',
        participantIds: ['usr-eleve-celestin', 'usr-eleve-belizaire', 'usr-eleve-joseph'],
        participantNames: {
          'usr-eleve-celestin': 'Marc-Alain Célestin',
          'usr-eleve-belizaire': 'Esther Bélizaire',
          'usr-eleve-joseph': 'Widline Joseph'
        },
        classId: 'class-ns1-a',
        className: 'Nouveau Secondaire 1 (NS1-A)',
        createdBy: 'usr-eleve-celestin',
        createdAt: '2024-10-10T14:00:00Z',
        status: 'active',
        isGroup: true,
        avatarColor: '#2563EB',
        lastMessage: {
          content: 'Mwen voye fich revizyon sou ekwasyon yo pou nou!',
          sentAt: new Date(Date.now() - 1800000).toISOString(),
          senderName: 'Esther Bélizaire',
          type: 'note'
        }
      },
      {
        id: 'conv-direct-etienne',
        schoolId: 'school-polycarpe',
        type: 'direct',
        title: 'Prof. Jacques Étienne',
        participantIds: ['usr-eleve-celestin', 'usr-prof-etienne'],
        participantNames: {
          'usr-eleve-celestin': 'Marc-Alain Célestin',
          'usr-prof-etienne': 'Prof. Jacques Étienne'
        },
        classId: 'class-ns1-a',
        className: 'Nouveau Secondaire 1 (NS1-A)',
        createdBy: 'usr-eleve-celestin',
        createdAt: '2024-10-15T16:00:00Z',
        status: 'active',
        isGroup: false,
        avatarColor: '#D97706',
        lastMessage: {
          content: 'Très bien Marc-Alain, votre démarche pour l\'exercice 3 est correcte.',
          sentAt: new Date(Date.now() - 86400000).toISOString(),
          senderName: 'Prof. Jacques Étienne',
          type: 'text'
        }
      }
    ];

    const list = this.get<ChatConversation[]>('chat_conversations', defaultConversations);
    let filtered = list;
    if (schoolId) {
      filtered = filtered.filter(c => c.schoolId === schoolId);
    }
    if (userId) {
      filtered = filtered.filter(c => c.participantIds.includes(userId));
    }
    return filtered;
  }

  addConversation(conversation: ChatConversation): void {
    const list = this.getConversations();
    const existingIndex = list.findIndex(c => c.id === conversation.id);
    if (existingIndex >= 0) {
      list[existingIndex] = conversation;
    } else {
      list.unshift(conversation);
    }
    this.set('chat_conversations', list);
  }

  updateConversation(conversation: ChatConversation): void {
    const list = this.getConversations().map(c => c.id === conversation.id ? conversation : c);
    this.set('chat_conversations', list);
  }

  getChatMessages(conversationId: string): ChatMessage[] {
    const defaultMessages: ChatMessage[] = [
      {
        id: 'msg-001',
        conversationId: 'conv-ns1-official',
        schoolId: 'school-polycarpe',
        senderId: 'usr-prof-etienne',
        senderName: 'Prof. Jacques Étienne',
        senderRole: 'enseignant',
        type: 'text',
        content: 'Bonjou tout elèv yo! Rappel important: Le contrôle de trigonométrie aura lieu ce vendredi en Salle 201.',
        sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        readBy: ['usr-eleve-celestin', 'usr-eleve-belizaire', 'usr-eleve-dorval']
      },
      {
        id: 'msg-002',
        conversationId: 'conv-ns1-official',
        schoolId: 'school-polycarpe',
        senderId: 'usr-eleve-celestin',
        senderName: 'Marc-Alain Célestin',
        senderRole: 'eleve',
        type: 'text',
        content: 'Mèsi pwofesè! Èske fòmil yo ap disponib sou fèy egzamen an?',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        readBy: ['usr-prof-etienne']
      },
      {
        id: 'msg-003',
        conversationId: 'conv-ns1-official',
        schoolId: 'school-polycarpe',
        senderId: 'usr-prof-etienne',
        senderName: 'Prof. Jacques Étienne',
        senderRole: 'enseignant',
        type: 'text',
        content: 'N\'oubliez pas le devoir de mathématiques pour jeudi matin ! Les formules fondamentales doivent être maîtrisées par cœur.',
        sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        readBy: ['usr-eleve-celestin']
      },
      {
        id: 'msg-004',
        conversationId: 'conv-etude-math-ns1',
        schoolId: 'school-polycarpe',
        senderId: 'usr-eleve-celestin',
        senderName: 'Marc-Alain Célestin',
        senderRole: 'eleve',
        type: 'text',
        content: 'Salut Esther! Mwen t ap gade egzèsis 4 sou fonksyon an, èske ou konprann kòman pou detèmine domèn definisyon an?',
        sentAt: new Date(Date.now() - 7200000).toISOString(),
        readBy: ['usr-eleve-belizaire', 'usr-eleve-joseph']
      },
      {
        id: 'msg-005',
        conversationId: 'conv-etude-math-ns1',
        schoolId: 'school-polycarpe',
        senderId: 'usr-eleve-belizaire',
        senderName: 'Esther Bélizaire',
        senderRole: 'eleve',
        type: 'voice',
        content: 'Vokal eksplikasyon domèn definisyon (Egzèsis 4)',
        duration: 18,
        mediaUrl: '',
        sentAt: new Date(Date.now() - 5400000).toISOString(),
        readBy: ['usr-eleve-celestin']
      },
      {
        id: 'msg-006',
        conversationId: 'conv-etude-math-ns1',
        schoolId: 'school-polycarpe',
        senderId: 'usr-eleve-belizaire',
        senderName: 'Esther Bélizaire',
        senderRole: 'eleve',
        type: 'note',
        content: 'Fich Rezime : Fonksyon ak Polynômes (Chapit 2)',
        noteData: {
          title: 'Fich Rezime : Fonksyon ak Polynômes',
          subject: 'Mathématiques NS1',
          text: '1. Domèn definisyon f(x) = P(x)/Q(x) egzije Q(x) ≠ 0.\n2. Rasin kare √(u(x)) egzije u(x) ≥ 0.\n3. Aks senetri : x = -b / (2a).\n4. Somè parabòl la : S(-b/2a, -Δ/4a).'
        },
        sentAt: new Date(Date.now() - 1800000).toISOString(),
        readBy: ['usr-eleve-celestin']
      },
      {
        id: 'msg-007',
        conversationId: 'conv-direct-etienne',
        schoolId: 'school-polycarpe',
        senderId: 'usr-eleve-celestin',
        senderName: 'Marc-Alain Célestin',
        senderRole: 'eleve',
        type: 'text',
        content: 'Bonsoir Monsieur Étienne. J\'ai repris l\'exercice 3 sur le théorème de Thalès, voici ma démarche.',
        sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        readBy: ['usr-prof-etienne']
      },
      {
        id: 'msg-008',
        conversationId: 'conv-direct-etienne',
        schoolId: 'school-polycarpe',
        senderId: 'usr-prof-etienne',
        senderName: 'Prof. Jacques Étienne',
        senderRole: 'enseignant',
        type: 'text',
        content: 'Très bien Marc-Alain, votre démarche pour l\'exercice 3 est correcte. Pensez à bien justifier le parallélisme des droites.',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        readBy: ['usr-eleve-celestin']
      }
    ];

    const all = this.get<ChatMessage[]>('chat_messages', defaultMessages);
    return all.filter(m => m.conversationId === conversationId);
  }

  addMessage(message: ChatMessage): void {
    const list = this.get<ChatMessage[]>('chat_messages', []);
    list.push(message);
    this.set('chat_messages', list);

    // Also update lastMessage in conversation
    const conversations = this.getConversations();
    const conv = conversations.find(c => c.id === message.conversationId);
    if (conv) {
      conv.lastMessage = {
        content: message.type === 'voice' ? 'Message vocal' : message.type === 'note' ? (message.noteData?.title || 'Fiche de note') : message.type === 'image' ? 'Photo partagée' : message.content,
        sentAt: message.sentAt,
        senderName: message.senderName,
        type: message.type
      };
      this.updateConversation(conv);
    }
  }

  getMessageRequests(schoolId?: string, toUserId?: string): MessageRequest[] {
    const defaultRequests: MessageRequest[] = [
      {
        id: 'req-001',
        schoolId: 'school-polycarpe',
        fromUserId: 'usr-eleve-dorval',
        fromUserName: 'Jean-Marc Dorval',
        fromUserRole: 'eleve',
        toUserId: 'usr-eleve-celestin',
        toUserName: 'Marc-Alain Célestin',
        toUserRole: 'eleve',
        classId: 'class-ns1-a',
        className: 'Nouveau Secondaire 1 (NS1-A)',
        initialMessage: 'Salut Marc-Alain! Mwen se Jean-Marc nan menm klas NS1-A avè w. Èske nou ka etidye ansanm pou egzamen Matematik la?',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];

    const list = this.get<MessageRequest[]>('message_requests', defaultRequests);
    let filtered = list;
    if (schoolId) {
      filtered = filtered.filter(r => r.schoolId === schoolId);
    }
    if (toUserId) {
      filtered = filtered.filter(r => r.toUserId === toUserId);
    }
    return filtered;
  }

  addMessageRequest(request: MessageRequest): void {
    const list = this.get<MessageRequest[]>('message_requests', []);
    list.unshift(request);
    this.set('message_requests', list);
  }

  updateMessageRequestStatus(requestId: string, status: 'accepted' | 'rejected'): MessageRequest | null {
    const list = this.getMessageRequests();
    const target = list.find(r => r.id === requestId);
    if (!target) return null;
    target.status = status;
    this.set('message_requests', list);

    // If accepted, auto-create the direct conversation between the two users!
    if (status === 'accepted') {
      const newConv: ChatConversation = {
        id: `conv-direct-${target.fromUserId}-${target.toUserId}`,
        schoolId: target.schoolId,
        type: 'direct',
        title: target.fromUserName,
        participantIds: [target.fromUserId, target.toUserId],
        participantNames: {
          [target.fromUserId]: target.fromUserName,
          [target.toUserId]: target.toUserName
        },
        classId: target.classId,
        className: target.className,
        createdBy: target.fromUserId,
        createdAt: new Date().toISOString(),
        status: 'active',
        isGroup: false,
        avatarColor: '#075B46',
        lastMessage: {
          content: target.initialMessage,
          sentAt: target.createdAt,
          senderName: target.fromUserName,
          type: 'text'
        }
      };
      this.addConversation(newConv);

      // Add initial message
      this.addMessage({
        id: `msg-req-init-${Date.now()}`,
        conversationId: newConv.id,
        schoolId: target.schoolId,
        senderId: target.fromUserId,
        senderName: target.fromUserName,
        senderRole: target.fromUserRole,
        type: 'text',
        content: target.initialMessage,
        sentAt: target.createdAt,
        readBy: [target.fromUserId]
      });
    }

    return target;
  }

  resetToSeed(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }
}

export const db = new DatabaseEngine();
