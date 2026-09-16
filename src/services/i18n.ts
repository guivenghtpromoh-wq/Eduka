/**
 * EDUKA - Internationalization (i18n) Engine
 * Supported Locales: Français (fr), Kreyòl Ayisyen (ht), English (en)
 * STRICT RULE: No emojis anywhere in UI text, buttons, alerts, or empty states.
 */

export type Locale = 'fr' | 'ht' | 'en';

export interface Translations {
  common: {
    appTitle: string;
    tagline: string;
    search: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    create: string;
    export: string;
    import: string;
    filter: string;
    status: string;
    actions: string;
    loading: string;
    offline: string;
    online: string;
    syncing: string;
    synced: string;
    syncPending: string;
    syncConflict: string;
    viewDetails: string;
    confirm: string;
    back: string;
    close: string;
    refresh: string;
    download: string;
    print: string;
    noData: string;
    all: string;
    yes: string;
    no: string;
    date: string;
    matricule: string;
    name: string;
    class: string;
    academicYear: string;
    school: string;
    role: string;
  };
  roles: {
    super_admin: string;
    admin: string;
    direction: string;
    secretaire: string;
    comptable: string;
    enseignant: string;
    parent: string;
    eleve: string;
  };
  navigation: {
    dashboard: string;
    students: string;
    teachers: string;
    classes: string;
    subjects: string;
    attendance: string;
    grades: string;
    reportCards: string;
    timetable: string;
    admissions: string;
    finance: string;
    documents: string;
    communication: string;
    assignments: string;
    reports: string;
    security: string;
    audit: string;
    settings: string;
    syncCenter: string;
    help: string;
    logout: string;
    more: string;
  };
  dashboard: {
    welcome: string;
    totalStudents: string;
    totalTeachers: string;
    activeClasses: string;
    attendanceToday: string;
    feeCollectionRate: string;
    quickRollCall: string;
    pendingInvoices: string;
    recentActivities: string;
    systemAlerts: string;
    offlineNotice: string;
  };
  attendance: {
    title: string;
    rollCall: string;
    selectClass: string;
    present: string;
    absent: string;
    late: string;
    excused: string;
    markAllPresent: string;
    saveAttendance: string;
    savedLocally: string;
    attendanceRate: string;
    absenceCount: string;
    reason: string;
  };
  grades: {
    title: string;
    assessments: string;
    newAssessment: string;
    score: string;
    maxScore: string;
    weight: string;
    average: string;
    generalAverage: string;
    locked: string;
    unlocked: string;
    lockGrades: string;
    validate: string;
    rank: string;
  };
  finance: {
    title: string;
    invoices: string;
    payments: string;
    newPayment: string;
    feesSchedule: string;
    amountDue: string;
    amountPaid: string;
    balanceRemaining: string;
    currency: string;
    method: string;
    receiptNumber: string;
    cash: string;
    moncash: string;
    natcash: string;
    bankTransfer: string;
    card: string;
    partialPayment: string;
    fullPayment: string;
    printReceipt: string;
    scholarship: string;
  };
  security: {
    title: string;
    activeSessions: string;
    connectedDevices: string;
    mfaStatus: string;
    auditLog: string;
    revokeSession: string;
    revokeAll: string;
    securityScore: string;
    failedAttempts: string;
    lockoutPolicy: string;
  };
  emptyStates: {
    noStudents: string;
    noStudentsDesc: string;
    noClasses: string;
    noClassesDesc: string;
    noGrades: string;
    noGradesDesc: string;
    noInvoices: string;
    noInvoicesDesc: string;
    noAudit: string;
    noAuditDesc: string;
  };
}

export const translations: Record<Locale, Translations> = {
  fr: {
    common: {
      appTitle: 'EDUKA',
      tagline: 'Plateforme Institutionnelle de Gestion Scolaire',
      search: 'Rechercher un élève, une classe, un reçu...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      create: 'Créer',
      export: 'Exporter',
      import: 'Importer CSV',
      filter: 'Filtrer',
      status: 'Statut',
      actions: 'Actions',
      loading: 'Chargement des données...',
      offline: 'Mode Hors Connexion',
      online: 'En ligne',
      syncing: 'Synchronisation en cours...',
      synced: 'Données synchronisées',
      syncPending: 'modifications en attente de synchronisation',
      syncConflict: 'Conflit de données détecté',
      viewDetails: 'Consulter',
      confirm: 'Confirmer',
      back: 'Retour',
      close: 'Fermer',
      refresh: 'Actualiser',
      download: 'Télécharger',
      print: 'Imprimer',
      noData: 'Aucune donnée disponible',
      all: 'Tous',
      yes: 'Oui',
      no: 'Non',
      date: 'Date',
      matricule: 'Matricule',
      name: 'Nom complet',
      class: 'Classe',
      academicYear: 'Année scolaire',
      school: 'Établissement',
      role: 'Rôle',
    },
    roles: {
      super_admin: 'Super Administrateur',
      admin: 'Administrateur',
      direction: 'Direction / Principal',
      secretaire: 'Secrétaire Général(e)',
      comptable: 'Comptable / Trésorier',
      enseignant: 'Professeur / Enseignant',
      parent: 'Parent / Tuteur Légal',
      eleve: 'Élève / Apprenant',
    },
    navigation: {
      dashboard: 'Tableau de bord',
      students: 'Élèves & Inscriptions',
      teachers: 'Corps Enseignant',
      classes: 'Classes & Salles',
      subjects: 'Matières & Coefficients',
      attendance: 'Présences & Appel',
      grades: 'Cahier de Notes',
      reportCards: 'Bulletins Scolaires',
      timetable: 'Emploi du Temps',
      admissions: 'Candidatures & Inscriptions',
      finance: 'Finances & Recouvrement',
      documents: 'Archives & Documents',
      communication: 'Messagerie & Alertes',
      assignments: 'Devoirs & Projets',
      reports: 'Rapports & Statistiques',
      security: 'Centre de Sécurité',
      audit: 'Journal d\'Audit',
      settings: 'Configuration Générale',
      syncCenter: 'File de Synchronisation',
      help: 'Aide & Documentation',
      logout: 'Déconnexion',
      more: 'Menu Supplémentaire',
    },
    dashboard: {
      welcome: 'Portail de gestion institutionnelle',
      totalStudents: 'Élèves Inscrits',
      totalTeachers: 'Enseignants Actifs',
      activeClasses: 'Classes Ouvertes',
      attendanceToday: 'Taux de Présence du Jour',
      feeCollectionRate: 'Taux de Recouvrement',
      quickRollCall: 'Lancer l\'appel rapide',
      pendingInvoices: 'Solde Impayé Global',
      recentActivities: 'Activités récentes vérifiées',
      systemAlerts: 'Avis de conformité et alertes',
      offlineNotice: 'Vous travaillez actuellement en mode déconnecté. Vos saisies locales sont conservées de manière sécurisée.',
    },
    attendance: {
      title: 'Gestion des Présences',
      rollCall: 'Appel Rapide de Classe',
      selectClass: 'Sélectionner la classe',
      present: 'Présent',
      absent: 'Absent',
      late: 'En retard',
      excused: 'Justifié',
      markAllPresent: 'Marquer tous présents',
      saveAttendance: 'Enregistrer l\'appel',
      savedLocally: 'Appel sauvegardé localement dans la base interne',
      attendanceRate: 'Taux d\'assiduité',
      absenceCount: 'Nombre d\'absences',
      reason: 'Motif de l\'absence / retard',
    },
    grades: {
      title: 'Gestion des Évaluations et Notes',
      assessments: 'Évaluations',
      newAssessment: 'Nouvelle Évaluation',
      score: 'Note',
      maxScore: 'Barème',
      weight: 'Coefficient',
      average: 'Moyenne de classe',
      generalAverage: 'Moyenne générale',
      locked: 'Notes verrouillées et auditées',
      unlocked: 'Saisie modifiable',
      lockGrades: 'Verrouiller pour publication',
      validate: 'Valider définitivement',
      rank: 'Rang au palmarès',
    },
    finance: {
      title: 'Gestion Financière et Frais Scolaires',
      invoices: 'Factures d\'Écolage',
      payments: 'Historique des Versements',
      newPayment: 'Encaisser un Versement',
      feesSchedule: 'Grille Tarifaire Institutionnelle',
      amountDue: 'Montant Dû',
      amountPaid: 'Montant Encaissé',
      balanceRemaining: 'Reste à Recouvrer',
      currency: 'Devise',
      method: 'Mode de Paiement',
      receiptNumber: 'Numéro de Reçu Officiel',
      cash: 'Espèces (Comptant)',
      moncash: 'MonCash',
      natcash: 'NatCash',
      bankTransfer: 'Virement / Dépôt Bancaire',
      card: 'Carte Bancaire',
      partialPayment: 'Paiement Partiel',
      fullPayment: 'Paiement Intégral',
      printReceipt: 'Imprimer le Reçu d\'Encaissement',
      scholarship: 'Exonération / Bourse',
    },
    security: {
      title: 'Centre de Sécurité & Contrôle des Accès',
      activeSessions: 'Sessions Actives',
      connectedDevices: 'Appareils Enregistrés',
      mfaStatus: 'Double Authentification (MFA)',
      auditLog: 'Journal d\'Audit Immuable',
      revokeSession: 'Révoquer cette session',
      revokeAll: 'Révoquer tous les autres appareils',
      securityScore: 'Niveau de Sécurité Global',
      failedAttempts: 'Tentatives d\'accès infructueuses',
      lockoutPolicy: 'Verrouillage progressif activé',
    },
    emptyStates: {
      noStudents: 'Aucun élève enregistré pour cet établissement',
      noStudentsDesc: 'Commencez par enregistrer un nouvel apprenant ou importez une liste normalisée au format CSV.',
      noClasses: 'Aucune classe configurée pour cette année scolaire',
      noClassesDesc: 'Créez les classes et attribuez les professeurs principaux dans les paramètres.',
      noGrades: 'Aucune note saisie pour cette sélection',
      noGradesDesc: 'Créez une évaluation puis saisissez les notes des élèves inscrits.',
      noInvoices: 'Aucune facture d\'écolage générée',
      noInvoicesDesc: 'Générez les factures pour la période scolaire en cours.',
      noAudit: 'Aucun événement d\'audit enregistré',
      noAuditDesc: 'Les actions critiques apparaîtront automatiquement dans ce registre.',
    },
  },
  ht: {
    common: {
      appTitle: 'EDUKA',
      tagline: 'Platfòm Jesyon Lekòl Pwofesyonèl',
      search: 'Chèche yon elèv, yon klas, yon resi...',
      save: 'Anrejistre',
      cancel: 'Anile',
      delete: 'Efase',
      edit: 'Modifye',
      add: 'Ajoute',
      create: 'Kreye',
      export: 'Ekspòte',
      import: 'Enpòte CSV',
      filter: 'Filtre',
      status: 'Estati',
      actions: 'Aksyon',
      loading: 'Done yo ap chaje...',
      offline: 'Mòd San Entènèt',
      online: 'Konekte',
      syncing: 'Senkronizasyon ap fèt...',
      synced: 'Done yo senkronize',
      syncPending: 'modifikasyon ki an atant senkronizasyon',
      syncConflict: 'Konfli done detekte',
      viewDetails: 'Wè detay',
      confirm: 'Konfime',
      back: 'Retounen',
      close: 'Fèmen',
      refresh: 'Rafrechi',
      download: 'Telechaje',
      print: 'Enprime',
      noData: 'Pa gen okenn done disponib',
      all: 'Tout',
      yes: 'Wi',
      no: 'Non',
      date: 'Dat',
      matricule: 'Matrikil',
      name: 'Non konplè',
      class: 'Klas',
      academicYear: 'Ane lekòl',
      school: 'Lekòl',
      role: 'Wòl',
    },
    roles: {
      super_admin: 'Gran Administratè',
      admin: 'Administratè',
      direction: 'Direksyon Lekòl',
      secretaire: 'Sekretè Jeneral',
      comptable: 'Kontab / Trezorye',
      enseignant: 'Pwofesè',
      parent: 'Paran / Responsab',
      eleve: 'Elèv',
    },
    navigation: {
      dashboard: 'Tablo Bò',
      students: 'Elèv & Enskripsyon',
      teachers: 'Pwofesè yo',
      classes: 'Klas & Sal yo',
      subjects: 'Matyè yo',
      attendance: 'Prezans & Apèl',
      grades: 'Kanè Nòt',
      reportCards: 'Bleten Eskolè',
      timetable: 'Orè Klas',
      admissions: 'Kandidati & Admision',
      finance: 'Finans & Frè Eskolè',
      documents: 'Dokiman & Achiv',
      communication: 'Mesaj & Alèt',
      assignments: 'Devwa & Travay',
      reports: 'Rapò & Estatistik',
      security: 'Sant Sekirite',
      audit: 'Jounal Odit',
      settings: 'Konfigirasyon',
      syncCenter: 'File Senkronizasyon',
      help: 'Èd & Gid',
      logout: 'Dekonekte',
      more: 'Lòt Meni',
    },
    dashboard: {
      welcome: 'Pòtay jesyon lekòl la',
      totalStudents: 'Kantite Elèv Enskri',
      totalTeachers: 'Pwofesè ki Aktif',
      activeClasses: 'Klas ki Louvri',
      attendanceToday: 'To Prezans pou Jounen an',
      feeCollectionRate: 'To Rekouvremant Frè yo',
      quickRollCall: 'Fè apèl rapid la',
      pendingInvoices: 'Rès Kòb pou Rantre',
      recentActivities: 'Aktivite ki fèk fèt',
      systemAlerts: 'Alèt ak rapèl enpòtan',
      offlineNotice: 'W ap travay san entènèt. Tout enfòmasyon ou mete yo anrejistre sou aparèy la san danje.',
    },
    attendance: {
      title: 'Jesyon Prezans',
      rollCall: 'Fè Apèl Klas la',
      selectClass: 'Chwazi klas la',
      present: 'Prezan',
      absent: 'Absan',
      late: 'An reta',
      excused: 'Jistifye',
      markAllPresent: 'Mete tout moun prezan',
      saveAttendance: 'Anrejistre apèl la',
      savedLocally: 'Apèl la anrejistre sou aparèy la',
      attendanceRate: 'To prezans',
      absenceCount: 'Kantite absans',
      reason: 'Rezon absans la',
    },
    grades: {
      title: 'Nòt ak Evalyasyon',
      assessments: 'Evalyasyon yo',
      newAssessment: 'Nouvo Evalyasyon',
      score: 'Nòt',
      maxScore: 'Total posib',
      weight: 'Koyefisyan',
      average: 'Mwayèn klas la',
      generalAverage: 'Mwayèn jeneral',
      locked: 'Nòt yo bloke epi verifye',
      unlocked: 'Ou ka modifye li',
      lockGrades: 'Bloke nòt yo pou pibliye',
      validate: 'Valide definitivman',
      rank: 'Ran nan klas la',
    },
    finance: {
      title: 'Finans ak Frè Lekòl',
      invoices: 'Fakti Lekòl',
      payments: 'Peman ki Fèt',
      newPayment: 'Pran yon Peman',
      feesSchedule: 'Lis Pri Ofisyèl',
      amountDue: 'Montan pou Peye',
      amountPaid: 'Montan Peye',
      balanceRemaining: 'Rès pou Peye',
      currency: 'Lajan',
      method: 'Fason peman fèt',
      receiptNumber: 'Nimewo Resi Ofisyèl',
      cash: 'Lajan kach',
      moncash: 'MonCash',
      natcash: 'NatCash',
      bankTransfer: 'Depo Labank',
      card: 'Kat labank',
      partialPayment: 'Peman Pasyèl',
      fullPayment: 'Peman Konplè',
      printReceipt: 'Enprime Resi a',
      scholarship: 'Bous / Rabè',
    },
    security: {
      title: 'Sant Sekirite ak Kontwòl Aksè',
      activeSessions: 'Sesyion ki Louvri',
      connectedDevices: 'Aparèy ki Konekte',
      mfaStatus: 'Doub Otantifikasyon (MFA)',
      auditLog: 'Jounal Odit Enchanjab',
      revokeSession: 'Fèmen sesyon sa a',
      revokeAll: 'Fèmen tout lòt aparèy yo',
      securityScore: 'Nivo Sekirite Jeneral',
      failedAttempts: 'Tantativ ki pa reyisi',
      lockoutPolicy: 'Pwoteksyon kont fòseman aktive',
    },
    emptyStates: {
      noStudents: 'Pa gen okenn elèv anrejistre nan lekòl sa a',
      noStudentsDesc: 'Kòmanse pa ajoute yon nouvo elèv oswa enpòte yon lis fichye CSV.',
      noClasses: 'Pa gen okenn klas ki kreye pou ane lekòl sa a',
      noClassesDesc: 'Kreye klas yo epi bay pwofesè responsab yo nan paramèt yo.',
      noGrades: 'Pa gen okenn nòt ki antre pou seleksyon sa a',
      noGradesDesc: 'Kreye yon evalyasyon anvan, apre sa antre nòt elèv yo.',
      noInvoices: 'Pa gen okenn fakti ki prepare',
      noInvoicesDesc: 'Prepare fakti pou peryòd eskolè an kour la.',
      noAudit: 'Pa gen okenn aksyon nan jounal odit la',
      noAuditDesc: 'Tout aksyon enpòtan ap parèt otomatikman isit la.',
    },
  },
  en: {
    common: {
      appTitle: 'EDUKA',
      tagline: 'Institutional School Management Platform',
      search: 'Search student, class, invoice receipt...',
      save: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      create: 'Create',
      export: 'Export',
      import: 'Import CSV',
      filter: 'Filter',
      status: 'Status',
      actions: 'Actions',
      loading: 'Loading system records...',
      offline: 'Offline Mode',
      online: 'Online',
      syncing: 'Synchronizing data...',
      synced: 'All data synchronized',
      syncPending: 'pending records to synchronize',
      syncConflict: 'Data conflict detected',
      viewDetails: 'View Details',
      confirm: 'Confirm',
      back: 'Back',
      close: 'Close',
      refresh: 'Refresh',
      download: 'Download',
      print: 'Print',
      noData: 'No data available',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      date: 'Date',
      matricule: 'Student ID',
      name: 'Full Name',
      class: 'Class',
      academicYear: 'Academic Year',
      school: 'School Branch',
      role: 'Role',
    },
    roles: {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      direction: 'Principal / Headmaster',
      secretaire: 'General Registrar',
      comptable: 'Accountant / Bursar',
      enseignant: 'Faculty / Teacher',
      parent: 'Parent / Legal Guardian',
      eleve: 'Student / Scholar',
    },
    navigation: {
      dashboard: 'Dashboard',
      students: 'Students & Enrollment',
      teachers: 'Faculty Members',
      classes: 'Classes & Rooms',
      subjects: 'Subjects & Weights',
      attendance: 'Attendance & Roll Call',
      grades: 'Gradebook',
      reportCards: 'Report Cards',
      timetable: 'Class Timetable',
      admissions: 'Admissions & Inquiries',
      finance: 'Finance & Tuition Billing',
      documents: 'Documents & Archive',
      communication: 'Messaging & Notices',
      assignments: 'Homework & Tasks',
      reports: 'Reports & Analytics',
      security: 'Security Center',
      audit: 'Audit Log Registry',
      settings: 'General Settings',
      syncCenter: 'Sync Queue',
      help: 'Help & Knowledgebase',
      logout: 'Sign Out',
      more: 'Extended Menu',
    },
    dashboard: {
      welcome: 'Institutional Management Portal',
      totalStudents: 'Enrolled Students',
      totalTeachers: 'Active Faculty',
      activeClasses: 'Active Classes',
      attendanceToday: 'Daily Attendance Rate',
      feeCollectionRate: 'Fee Collection Rate',
      quickRollCall: 'Start Quick Roll Call',
      pendingInvoices: 'Outstanding Receivables',
      recentActivities: 'Verified Recent Operations',
      systemAlerts: 'Compliance Alerts & Notices',
      offlineNotice: 'Working in offline mode. Local records are securely encrypted on this terminal.',
    },
    attendance: {
      title: 'Attendance Management',
      rollCall: 'Fast Class Roll Call',
      selectClass: 'Select Class',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      markAllPresent: 'Mark all present',
      saveAttendance: 'Commit Attendance',
      savedLocally: 'Attendance stored locally in terminal database',
      attendanceRate: 'Attendance rate',
      absenceCount: 'Total absences',
      reason: 'Absence / tardiness justification',
    },
    grades: {
      title: 'Assessments & Grade Records',
      assessments: 'Assessments',
      newAssessment: 'New Assessment',
      score: 'Grade',
      maxScore: 'Scale / Total',
      weight: 'Coefficient',
      average: 'Class average',
      generalAverage: 'Cumulative average',
      locked: 'Grades locked and audited',
      unlocked: 'Editable draft',
      lockGrades: 'Lock grades for publication',
      validate: 'Confirm validation',
      rank: 'Honor roll rank',
    },
    finance: {
      title: 'Financial & Tuition Management',
      invoices: 'Tuition Invoices',
      payments: 'Transaction History',
      newPayment: 'Record Payment',
      feesSchedule: 'Official Tuition Matrix',
      amountDue: 'Amount Due',
      amountPaid: 'Amount Paid',
      balanceRemaining: 'Outstanding Balance',
      currency: 'Currency',
      method: 'Payment Method',
      receiptNumber: 'Official Receipt ID',
      cash: 'Cash Tender',
      moncash: 'MonCash',
      natcash: 'NatCash',
      bankTransfer: 'Direct Bank Deposit',
      card: 'Debit / Credit Card',
      partialPayment: 'Partial Installment',
      fullPayment: 'Paid in Full',
      printReceipt: 'Print Institutional Receipt',
      scholarship: 'Scholarship / Waiver',
    },
    security: {
      title: 'Security Center & Access Control',
      activeSessions: 'Active Sessions',
      connectedDevices: 'Registered Terminals',
      mfaStatus: 'Two-Factor Auth (MFA)',
      auditLog: 'Immutable Audit Trail',
      revokeSession: 'Revoke Session',
      revokeAll: 'Revoke All Other Terminals',
      securityScore: 'Overall Security Score',
      failedAttempts: 'Unsuccessful authentication attempts',
      lockoutPolicy: 'Progressive rate-limit active',
    },
    emptyStates: {
      noStudents: 'No students enrolled for this school branch',
      noStudentsDesc: 'Begin by enrolling a new scholar or import an approved CSV roster.',
      noClasses: 'No classes configured for this academic term',
      noClassesDesc: 'Establish class divisions and assign homeroom instructors in Settings.',
      noGrades: 'No grade entries found for current criteria',
      noGradesDesc: 'Schedule an assessment first, then submit student performance marks.',
      noInvoices: 'No tuition invoices generated',
      noInvoicesDesc: 'Generate tuition assessments for the current academic session.',
      noAudit: 'No recorded audit log events',
      noAuditDesc: 'System operations and sensitive actions will be appended here automatically.',
    },
  },
};
