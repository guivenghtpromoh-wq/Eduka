/**
 * EDUKA - Teachers & Faculty Management Module
 * Academic workload, subject specializations, qualifications, and class assignments.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Plus,
  Search,
  X,
  Clock,
  Award
} from 'lucide-react';
import { School, Teacher } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/UIStates';

interface TeachersViewProps {
  currentSchool: School;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ currentSchool }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(() => db.getTeachers(currentSchool.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: 'Mathématiques',
    qualification: 'Licence en Mathématiques / ENS',
    weeklyHours: 18,
  });

  const canManage = auth.hasPermission('teachers.manage');

  const filteredTeachers = teachers.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.firstName.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      t.specialty.toLowerCase().includes(q)
    );
  });

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;

    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      schoolId: currentSchool.id,
      matricule: `ENS-${Date.now().toString().slice(-4)}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim() || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@eduka.ht`,
      phone: formData.phone.trim() || '+509 3700-0000',
      specialty: formData.specialty,
      qualification: formData.qualification,
      assignedClassIds: ['cls-001'],
      assignedSubjectIds: ['sub-001'],
      weeklyHours: Number(formData.weeklyHours) || 18,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
    };

    db.addTeacher(newTeacher);
    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'teachers.create',
      resource: 'Teacher',
      resourceId: newTeacher.id,
      details: `Ajout de l'enseignant Prof. ${newTeacher.firstName} ${newTeacher.lastName} (${newTeacher.specialty})`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setTeachers(db.getTeachers(currentSchool.id));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Corps Enseignant & Personnel Académique</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              {teachers.length} professeurs
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Gestion des qualifications, des volumes horaires et des attributions disciplinaires
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
              <span>Nouveau Professeur</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom ou spécialité..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-[#F5F7F6] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Teachers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(teacher => (
          <div
            key={teacher.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#075B46] uppercase">
                  {teacher.specialty}
                </span>
                <h3 className="text-base font-bold text-[#17201D] mt-0.5">
                  Prof. {teacher.firstName} {teacher.lastName}
                </h3>
                <div className="text-xs text-[#66736D] mt-0.5">{teacher.qualification}</div>
              </div>
              <StatusBadge status={teacher.status} />
            </div>

            <div className="p-3 bg-[#F5F7F6] rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{teacher.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-[#075B46] shrink-0" />
                <span>Volume horaire : <strong>{teacher.weeklyHours}h / semaine</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Classes attribuées : NS1-A, Philo</span>
              <span className="text-[#075B46] font-semibold text-[11px]">Dossier Certifié</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17201D]">Ajout d'un Enseignant</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Spécialité disciplinaire *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Mathématiques & Physique"
                  value={formData.specialty}
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Diplôme / Qualification</label>
                <input
                  type="text"
                  placeholder="ex. Master en Sciences de l'Éducation"
                  value={formData.qualification}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+509 3700-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Charge hebdo (heures)</label>
                  <input
                    type="number"
                    min="2"
                    max="40"
                    value={formData.weeklyHours}
                    onChange={e => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
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
                  Enregistrer l'Enseignant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
