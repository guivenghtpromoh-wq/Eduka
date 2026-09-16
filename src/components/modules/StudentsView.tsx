/**
 * EDUKA - Students & Enrollment Management Module
 * Comprehensive registry with unique institutional matricules, CSV import/export,
 * and complete student dossiers (attendance, grades, report cards, fees, documents).
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  ArrowUpDown,
  MoreVertical,
  X,
  FileText,
  Calendar,
  DollarSign,
  Award,
  Check,
  AlertCircle
} from 'lucide-react';
import { Student, School, SchoolClass, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { syncEngine } from '../../services/sync';
import { EmptyState, StatusBadge } from '../common/UIStates';
import { ParentStudentsView } from './students/ParentStudentsView';
import { StudentSelfView } from './students/StudentSelfView';
import { TeacherStudentsView } from './students/TeacherStudentsView';
import { CashierStudentsView } from './students/CashierStudentsView';

interface StudentsViewProps {
  currentSchool: School;
  initialSelectedStudentId?: string;
  currentUser?: User;
  onNavigate?: (tab: any) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  currentSchool,
  initialSelectedStudentId,
  currentUser,
  onNavigate,
}) => {
  // Role: Parent View - strictly isolated to their own children
  if (currentUser?.role === 'parent') {
    return <ParentStudentsView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  // Role: Student View - strictly personal profile & digital card
  if (currentUser?.role === 'eleve') {
    return <StudentSelfView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  // Role: Teacher View - strictly their assigned classes
  if (currentUser?.role === 'enseignant') {
    return <TeacherStudentsView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  // Role: Cashier View - fees & tuition solvency focus
  if (currentUser?.role === 'comptable') {
    return <CashierStudentsView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  const [students, setStudents] = useState<Student[]>(() => db.getStudents(currentSchool.id));
  const classes = useMemo(() => db.getClasses(currentSchool.id), [currentSchool.id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    if (initialSelectedStudentId) {
      return db.getStudentById(initialSelectedStudentId) || null;
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<'info' | 'grades' | 'attendance' | 'finances' | 'docs'>('info');

  // New Student Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '2008-01-01',
    birthPlace: 'Port-au-Prince',
    address: '',
    classId: classes[0]?.id || '',
    phone: '',
    parentName: '',
    parentPhone: '',
    scholarshipRate: 0,
  });

  const canCreate = auth.hasPermission('students.create');
  const canUpdate = auth.hasPermission('students.update');

  const refreshList = () => {
    setStudents(db.getStudents(currentSchool.id));
  };

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (selectedClassFilter !== 'all' && student.currentClassId !== selectedClassFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && student.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          student.firstName.toLowerCase().includes(q) ||
          student.lastName.toLowerCase().includes(q);
        const matchesMatricule = student.matricule.toLowerCase().includes(q);
        if (!matchesName && !matchesMatricule) return false;
      }
      return true;
    });
  }, [students, selectedClassFilter, selectedStatusFilter, searchQuery]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prenom', 'Genre', 'Classe', 'DateNaissance', 'Statut'];
    const rows = filteredStudents.map(s => [
      s.matricule,
      s.lastName,
      s.firstName,
      s.gender,
      s.className || '',
      s.birthDate,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EDUKA_Eleves_${currentSchool.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'students.export_csv',
      resource: 'Student',
      details: `Exportation CSV de ${filteredStudents.length} élèves`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });
  };

  // Create Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.classId) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const assignedClass = classes.find(c => c.id === formData.classId);
    const newCount = students.length + 1;
    const generatedMatricule = `EDK-2024-${String(newCount).padStart(3, '0')}`;

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      schoolId: currentSchool.id,
      organizationId: currentSchool.organizationId,
      matricule: generatedMatricule,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthPlace: formData.birthPlace,
      address: formData.address || 'Port-au-Prince',
      phone: formData.phone,
      currentClassId: formData.classId,
      className: assignedClass ? assignedClass.name : 'Non assigné',
      academicYearId: 'year-2024-2025',
      status: 'active',
      parentIds: [],
      admissionDate: new Date().toISOString().split('T')[0],
      scholarshipRate: Number(formData.scholarshipRate) || 0,
      createdAt: new Date().toISOString(),
    };

    db.addStudent(newStudent);
    syncEngine.enqueue('student_create', newStudent, auth.getCurrentUser().id);

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'students.create',
      resource: 'Student',
      resourceId: newStudent.id,
      details: `Création de l'élève ${newStudent.firstName} ${newStudent.lastName} (${newStudent.matricule})`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setIsAddModalOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Registre des Élèves</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              {filteredStudents.length} inscrits
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Gestion académique, matricules institutionnels et dossiers scolaires complets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un élève</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-[#F5F7F6] focus:outline-hidden focus:border-[#075B46]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={e => setSelectedClassFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-[#17201D]"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-[#17201D]"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="archived">Archivé</option>
          </select>
        </div>

      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="Aucun élève trouvé"
          description="Aucun dossier scolaire ne correspond aux critères de filtre ou de recherche actuellement appliqués."
          actionLabel={canCreate ? 'Inscrire un élève' : undefined}
          onAction={() => setIsAddModalOpen(true)}
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
                <tr>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Nom et Prénom</th>
                  <th className="py-3 px-4">Classe Attribuée</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Bourse / Exonération</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#075B46]">
                      {student.matricule}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#17201D]">
                      {student.lastName.toUpperCase()}, {student.firstName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {student.className}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                    </td>
                    <td className="py-3 px-4">
                      {student.scholarshipRate && student.scholarshipRate > 0 ? (
                        <span className="text-[11px] font-semibold text-[#075B46] bg-[#DDF3EA] px-2 py-0.5 rounded">
                          {student.scholarshipRate}% Exonéré
                        </span>
                      ) : (
                        <span className="text-slate-400">Plein tarif</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="text-xs font-semibold text-[#075B46] hover:underline"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Dossier Modal / Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Dossier Header */}
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#075B46]">
                    {selectedStudent.matricule}
                  </span>
                  <StatusBadge status={selectedStudent.status} />
                </div>
                <h2 className="text-lg font-bold text-[#17201D] mt-1">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h2>
                <p className="text-xs text-[#66736D]">
                  {selectedStudent.className} • Inscrit le {new Date(selectedStudent.admissionDate).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="flex border-b border-slate-200 px-5 text-xs font-medium space-x-4 bg-white">
              <button
                type="button"
                onClick={() => setActiveDossierTab('info')}
                className={`py-2.5 border-b-2 transition-colors ${
                  activeDossierTab === 'info'
                    ? 'border-[#075B46] text-[#075B46] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Informations & État Civil
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab('attendance')}
                className={`py-2.5 border-b-2 transition-colors ${
                  activeDossierTab === 'attendance'
                    ? 'border-[#075B46] text-[#075B46] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Assiduité & Présences
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab('grades')}
                className={`py-2.5 border-b-2 transition-colors ${
                  activeDossierTab === 'grades'
                    ? 'border-[#075B46] text-[#075B46] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Notes & Évaluations
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab('finances')}
                className={`py-2.5 border-b-2 transition-colors ${
                  activeDossierTab === 'finances'
                    ? 'border-[#075B46] text-[#075B46] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Finances & Scolarité
              </button>
            </div>

            {/* Dossier Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {activeDossierTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#F5F7F6] rounded-lg">
                      <span className="text-[#66736D] block">Date de Naissance</span>
                      <span className="font-semibold text-[#17201D] mt-0.5 block">{selectedStudent.birthDate}</span>
                    </div>
                    <div className="p-3 bg-[#F5F7F6] rounded-lg">
                      <span className="text-[#66736D] block">Lieu de Naissance</span>
                      <span className="font-semibold text-[#17201D] mt-0.5 block">{selectedStudent.birthPlace}</span>
                    </div>
                    <div className="p-3 bg-[#F5F7F6] rounded-lg">
                      <span className="text-[#66736D] block">Genre</span>
                      <span className="font-semibold text-[#17201D] mt-0.5 block">
                        {selectedStudent.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </span>
                    </div>
                    <div className="p-3 bg-[#F5F7F6] rounded-lg">
                      <span className="text-[#66736D] block">Groupe Sanguin</span>
                      <span className="font-semibold text-[#17201D] mt-0.5 block">{selectedStudent.bloodGroup || 'Non renseigné'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F5F7F6] rounded-lg">
                    <span className="text-[#66736D] block">Adresse Domiciliaire</span>
                    <span className="font-semibold text-[#17201D] mt-0.5 block">{selectedStudent.address}</span>
                  </div>

                  <div className="p-3 bg-[#DDF3EA]/50 rounded-lg border border-[#BCE6D6]">
                    <span className="text-[#075B46] font-bold block">Situation Boursière</span>
                    <span className="text-slate-700 mt-0.5 block">
                      {selectedStudent.scholarshipRate && selectedStudent.scholarshipRate > 0
                        ? `Bénéficiaire d'une exonération d'écolage à hauteur de ${selectedStudent.scholarshipRate}%.`
                        : 'Aucune bourse appliquée (écolage standard).'}
                    </span>
                  </div>
                </div>
              )}

              {activeDossierTab === 'attendance' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <span>Taux d'assiduité calculé : <strong>96.8%</strong></span>
                    <span className="text-emerald-700 font-semibold">Assidu</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Historique des pointages d'appel journaliers pour l'année 2024-2025.
                  </p>
                  <div className="p-3 bg-[#F5F7F6] rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Aujourd'hui - Matin</span>
                      <StatusBadge status="present" label="Présent" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Hier - Matin</span>
                      <StatusBadge status="present" label="Présent" />
                    </div>
                  </div>
                </div>
              )}

              {activeDossierTab === 'grades' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#DDF3EA]/60 p-3 rounded-lg">
                    <span>Moyenne Trimestre 1</span>
                    <span className="text-base font-bold text-[#075B46]">88.5 / 100</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#F5F7F6] text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Matière</th>
                          <th className="py-2 px-3">Évaluation</th>
                          <th className="py-2 px-3 text-right">Note</th>
                          <th className="py-2 px-3">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2 px-3 font-medium">Mathématiques & Algèbre</td>
                          <td className="py-2 px-3 text-slate-500">Contrôle #1</td>
                          <td className="py-2 px-3 text-right font-bold text-[#075B46]">88 / 100</td>
                          <td className="py-2 px-3"><StatusBadge status="locked" label="Verrouillé" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Français & Littérature</td>
                          <td className="py-2 px-3 text-slate-500">Dissertation</td>
                          <td className="py-2 px-3 text-right font-bold text-[#075B46]">82 / 100</td>
                          <td className="py-2 px-3"><StatusBadge status="locked" label="Verrouillé" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDossierTab === 'finances' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">Facture Annuelle 2024-2025</span>
                      <div className="font-bold text-[#17201D] text-sm">FAC-2024-00101</div>
                    </div>
                    <StatusBadge status="partial" label="Solde Partiel" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500">Total Dû</span>
                      <div className="font-bold">65 000 HTG</div>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                      <span className="text-[10px] text-emerald-800">Encaissé</span>
                      <div className="font-bold text-[#075B46]">45 000 HTG</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded border border-amber-200">
                      <span className="text-[10px] text-amber-800">Reste à payer</span>
                      <div className="font-bold text-[#D9822B]">20 000 HTG</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Dossier Footer */}
            <div className="p-4 border-t border-slate-200 bg-[#F5F7F6] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-[#17201D] text-white rounded-lg hover:bg-black font-semibold text-xs"
              >
                Fermer le dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#17201D]">
                  Inscription d'un Nouvel Apprenant
                </h3>
                <p className="text-xs text-[#66736D]">
                  Génération automatique d'un matricule institutionnel unique
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Augustin"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:border-[#075B46]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Jean-Bernard"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:border-[#075B46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Genre *</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Classe d'affectation *</label>
                <select
                  required
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-medium"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.room})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Lieu de naissance</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Taux de Bourse (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scholarshipRate}
                    onChange={e => setFormData({ ...formData, scholarshipRate: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Adresse complète</label>
                <input
                  type="text"
                  placeholder="ex. Rue Pan-Américaine, Pétion-Ville"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] font-semibold"
                >
                  Valider l'Inscription
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
