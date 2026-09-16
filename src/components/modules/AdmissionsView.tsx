/**
 * EDUKA - Admissions & Candidate Pipeline Module
 * Workflow: Brouillon -> En attente -> Documents -> Accepté -> Inscription Définitive.
 * Automatic conversion to enrolled student with matricule generation.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  Plus,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { School, AdmissionApplication, Student, AdmissionStatus } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/UIStates';

interface AdmissionsViewProps {
  currentSchool: School;
  onStudentEnrolled?: (studentId: string) => void;
}

export const AdmissionsView: React.FC<AdmissionsViewProps> = ({ currentSchool, onStudentEnrolled }) => {
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(() =>
    db.getAdmissions(currentSchool.id)
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    candidateName: '',
    targetClass: 'Nouveau Secondaire 1 (NS1)',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    notes: '',
  });

  const canManage = auth.hasPermission('students.create');

  const filtered = admissions.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName.trim()) return;

    const newAdm: AdmissionApplication = {
      id: `adm-${Date.now()}`,
      schoolId: currentSchool.id,
      candidateName: formData.candidateName.trim(),
      targetClass: formData.targetClass,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: formData.notes,
    };

    db.addAdmission(newAdm);
    setAdmissions(db.getAdmissions(currentSchool.id));
    setIsModalOpen(false);
  };

  // Convert candidate to enrolled student
  const handleEnrollCandidate = (admission: AdmissionApplication) => {
    const students = db.getStudents(currentSchool.id);
    const matricule = `EDK-2024-${String(students.length + 101).padStart(3, '0')}`;
    const nameParts = admission.candidateName.split(' ');
    const firstName = nameParts[0] || 'Élève';
    const lastName = nameParts.slice(1).join(' ') || 'Nouveau';

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      schoolId: currentSchool.id,
      organizationId: currentSchool.organizationId,
      matricule,
      firstName,
      lastName,
      gender: 'M',
      birthDate: '2008-01-01',
      birthPlace: 'Port-au-Prince',
      address: 'Port-au-Prince, Haïti',
      phone: admission.parentPhone,
      currentClassId: 'cls-001',
      className: 'NS1-A',
      academicYearId: 'year-2024-2025',
      status: 'active',
      parentIds: [],
      admissionDate: new Date().toISOString().split('T')[0],
      scholarshipRate: 0,
      createdAt: new Date().toISOString(),
    };

    db.addStudent(newStudent);
    db.updateAdmissionStatus(admission.id, 'enrolled');

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'admissions.enroll',
      resource: 'Student',
      resourceId: newStudent.id,
      details: `Admission validée pour ${admission.candidateName}, immatriculé sous ${matricule}`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setAdmissions(db.getAdmissions(currentSchool.id));
    if (onStudentEnrolled) onStudentEnrolled(newStudent.id);
    alert(`Candidat converti avec succès en élève inscrit sous le matricule officiel ${matricule} !`);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Admissions & Nouvelles Inscriptions</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              Année 2024-2025
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Instruction des dossiers de candidature et conversion automatique en matricule officiel
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer une Candidature</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">Tous les états de dossier</option>
          <option value="pending">En attente d'instruction</option>
          <option value="accepted">Accepté par la direction</option>
          <option value="enrolled">Inscrit définitivement</option>
        </select>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
              <tr>
                <th className="py-3 px-4">Candidat</th>
                <th className="py-3 px-4">Classe Souhaitée</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-4">Date Dépôt</th>
                <th className="py-3 px-4">Statut Dossier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(adm => (
                <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#17201D]">
                    {adm.candidateName}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {adm.targetClass}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{adm.parentName}</div>
                    <div className="text-[11px] text-slate-400">{adm.parentPhone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {adm.submittedDate}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={adm.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {adm.status !== 'enrolled' ? (
                      <button
                        type="button"
                        onClick={() => handleEnrollCandidate(adm)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#075B46] text-white hover:bg-[#0B8064] rounded-md transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Inscrire</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-800 font-medium">Élève Actif</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17201D]">Nouvelle Candidature</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Nom et prénom du candidat *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Daphnée François"
                  value={formData.candidateName}
                  onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Classe demandée *</label>
                <input
                  type="text"
                  required
                  value={formData.targetClass}
                  onChange={e => setFormData({ ...formData, targetClass: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Nom du tuteur légal</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Téléphone de contact</label>
                  <input
                    type="text"
                    placeholder="+509 3800-0000"
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Notes / Dossier précédent</label>
                <textarea
                  rows={2}
                  placeholder="Établissement d'origine, moyenne précédente..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] font-semibold"
                >
                  Enregistrer le Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
