/**
 * EDUKA - Academic Classes & Rooms Management Module
 * Rosters, capacity limits, titulaire assignments, and room schedules.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  School as SchoolIcon,
  Users,
  Plus,
  ArrowRight,
  X,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { School, SchoolClass, Teacher } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/UIStates';

interface ClassesViewProps {
  currentSchool: School;
  onNavigateToAttendance?: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ currentSchool, onNavigateToAttendance }) => {
  const [classes, setClasses] = useState<SchoolClass[]>(() => db.getClasses(currentSchool.id));
  const teachers = useMemo(() => db.getTeachers(currentSchool.id), [currentSchool.id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: 'Secondaire',
    section: 'A',
    room: 'Salle 203',
    capacity: 35,
    mainTeacherId: teachers[0]?.id || '',
  });

  const canManage = auth.hasPermission('classes.manage');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const teacher = teachers.find(t => t.id === formData.mainTeacherId);

    const newClass: SchoolClass = {
      id: `cls-${Date.now()}`,
      schoolId: currentSchool.id,
      name: formData.name.trim(),
      level: formData.level,
      section: formData.section,
      room: formData.room,
      capacity: Number(formData.capacity) || 30,
      studentCount: 0,
      mainTeacherId: formData.mainTeacherId,
      mainTeacherName: teacher ? `Prof. ${teacher.firstName} ${teacher.lastName}` : undefined,
      academicYearId: 'year-2024-2025',
    };

    db.addClass(newClass);
    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'classes.create',
      resource: 'Class',
      resourceId: newClass.id,
      details: `Création de la classe ${newClass.name} (${newClass.room})`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setClasses(db.getClasses(currentSchool.id));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Organisation des Classes & Salles</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              {classes.length} divisions actives
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Affectations des professeurs titulaires, gestion des jauges et occupation des locaux
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Classe</span>
          </button>
        )}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => {
          const occupancy = Math.round(((cls.studentCount || 0) / cls.capacity) * 100);

          return (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#075B46] uppercase">
                    {cls.level} • Section {cls.section}
                  </span>
                  <h3 className="text-lg font-bold text-[#17201D] mt-0.5">{cls.name}</h3>
                  <div className="text-xs text-[#66736D] mt-0.5">{cls.room}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F5F7F6] text-slate-700 rounded border border-slate-200">
                  {occupancy}% Occupée
                </span>
              </div>

              <div className="p-3 bg-[#F5F7F6] rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Professeur Titulaire :</span>
                  <span className="font-semibold text-[#17201D]">{cls.mainTeacherName || 'Non assigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Effectif Actuel :</span>
                  <span className="font-bold text-[#075B46]">{cls.studentCount} / {cls.capacity} élèves</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#075B46] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(occupancy, 100)}%` }}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={onNavigateToAttendance}
                  className="text-xs font-semibold text-[#075B46] hover:underline flex items-center gap-1"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Faire l'appel</span>
                </button>
                <span className="text-slate-400 text-[11px]">Année 2024-2025</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17201D]">Création d'une Classe</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Nom de la classe *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. NS2 - Série Scientifique"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Niveau</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Salle attribuée</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Capacité maximale</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Professeur titulaire</label>
                <select
                  value={formData.mainTeacherId}
                  onChange={e => setFormData({ ...formData, mainTeacherId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      Prof. {t.firstName} {t.lastName} ({t.specialty})
                    </option>
                  ))}
                </select>
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
                  Enregistrer la Classe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
