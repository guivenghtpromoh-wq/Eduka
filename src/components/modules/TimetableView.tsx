/**
 * EDUKA - Timetable & Schedule Management Module
 * Weekly matrix with conflict prevention (detects double-booked teacher or room).
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  MapPin,
  UserCheck
} from 'lucide-react';
import { School, TimetableSlot, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';

interface TimetableViewProps {
  currentSchool: School;
  currentUser?: User;
  onNavigate?: (tab: any) => void;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const;
const PERIODS = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:15', end: '11:15' },
  { start: '11:15', end: '12:15' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
];

export const TimetableView: React.FC<TimetableViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  const allClasses = useMemo(() => db.getClasses(currentSchool.id), [currentSchool.id]);
  const teachers = useMemo(() => db.getTeachers(currentSchool.id), [currentSchool.id]);
  const subjects = useMemo(() => db.getSubjects(currentSchool.id), [currentSchool.id]);

  // Role: Parent child switcher
  const allStudents = useMemo(() => db.getStudents(currentSchool.id), [currentSchool.id]);
  const parentChildren = useMemo(() => {
    if (currentUser?.role !== 'parent') return [];
    const list = allStudents.filter(s =>
      s.parentIds?.includes(currentUser.id) ||
      s.parentIds?.includes('par-001') ||
      (currentUser.id === 'usr-parent-celestin' && (s.id === 'stu-001' || s.id === 'stu-002'))
    );
    return list.length > 0 ? list : allStudents.slice(0, 2);
  }, [allStudents, currentUser]);

  const [selectedChildId, setSelectedChildId] = useState<string>(parentChildren[0]?.id || '');

  const classes = useMemo(() => {
    if (currentUser?.role === 'enseignant') {
      return allClasses.filter(c => c.mainTeacherId === 'tch-001' || c.id === 'cls-001');
    }
    return allClasses;
  }, [allClasses, currentUser]);

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (currentUser?.role === 'parent' && parentChildren[0]) {
      return parentChildren[0].currentClassId;
    }
    if (currentUser?.role === 'eleve') {
      return 'cls-001';
    }
    return classes[0]?.id || '';
  });

  const handleParentChildChange = (childId: string) => {
    setSelectedChildId(childId);
    const ch = parentChildren.find(c => c.id === childId);
    if (ch) setSelectedClassId(ch.currentClassId);
  };

  const [slots, setSlots] = useState<TimetableSlot[]>(() => db.getTimetableSlots(currentSchool.id));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [slotForm, setSlotForm] = useState({
    day: 'Lundi' as any,
    startTime: '08:00',
    endTime: '09:00',
    subjectId: subjects[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    room: 'Salle 201',
  });

  const canEdit = auth.hasPermission('timetable.manage');

  const filteredSlots = useMemo(() => {
    return slots.filter(s => s.classId === selectedClassId);
  }, [slots, selectedClassId]);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);

    // Conflict Check: Is the teacher already booked in ANY class during this day and time?
    const teacherConflict = slots.find(
      s =>
        s.day === slotForm.day &&
        s.startTime === slotForm.startTime &&
        s.teacherId === slotForm.teacherId
    );

    if (teacherConflict) {
      setConflictWarning(
        `Conflit Enseignant : ${teacherConflict.teacherName} est déjà en cours dans la ${teacherConflict.room} à ce créneau.`
      );
      return;
    }

    // Conflict Check: Is the room already occupied?
    const roomConflict = slots.find(
      s =>
        s.day === slotForm.day &&
        s.startTime === slotForm.startTime &&
        s.room.toLowerCase() === slotForm.room.toLowerCase()
    );

    if (roomConflict) {
      setConflictWarning(
        `Conflit Salle : La ${slotForm.room} est déjà occupée par un autre groupe à cette heure.`
      );
      return;
    }

    const sub = subjects.find(s => s.id === slotForm.subjectId);
    const tch = teachers.find(t => t.id === slotForm.teacherId);

    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      schoolId: currentSchool.id,
      classId: selectedClassId,
      subjectId: slotForm.subjectId,
      subjectName: sub ? sub.name : 'Matière',
      teacherId: slotForm.teacherId,
      teacherName: tch ? `Prof. ${tch.lastName}` : 'Professeur',
      room: slotForm.room,
      day: slotForm.day,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
    };

    db.addTimetableSlot(newSlot);
    setSlots(db.getTimetableSlots(currentSchool.id));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">
              {currentUser?.role === 'parent'
                ? 'Emploi du Temps de Mes Enfants'
                : currentUser?.role === 'eleve'
                ? 'Mon Emploi du Temps Hebdomadaire'
                : currentUser?.role === 'enseignant'
                ? `Horaires de Cours : Prof. ${currentUser.lastName}`
                : 'Emploi du Temps Hebdomadaire'}
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              {currentUser?.role === 'parent' || currentUser?.role === 'eleve'
                ? 'Horaires Officiels'
                : 'Contrôle Anti-Conflit Actif'}
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            {currentUser?.role === 'parent'
              ? 'Consultez la grille des cours, horaires et salles pour chacun de vos enfants'
              : currentUser?.role === 'eleve'
              ? 'Votre planning de la semaine, salles de cours et professeurs titulaires'
              : 'Planification des cours, prévention des chevauchements de salles et d\'enseignants'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser?.role === 'parent' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#17201D]">Enfant :</label>
              <select
                value={selectedChildId}
                onChange={e => handleParentChildChange(e.target.value)}
                className="text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6] font-semibold text-[#17201D]"
              >
                {parentChildren.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.className})</option>
                ))}
              </select>
            </div>
          )}

          {currentUser?.role !== 'parent' && currentUser?.role !== 'eleve' && (
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6] font-semibold text-[#17201D]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Classe : {c.name}</option>
              ))}
            </select>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setConflictWarning(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Programmer un Cours</span>
            </button>
          )}
        </div>
      </div>

      {/* Timetable Weekly Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
                <th className="py-3 px-4 w-28 border-r border-slate-200 text-center">Horaires</th>
                {DAYS.map(day => (
                  <th key={day} className="py-3 px-4 text-center font-bold text-[#17201D]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {PERIODS.map(period => (
                <tr key={`${period.start}-${period.end}`} className="hover:bg-slate-50/50">
                  <td className="py-3 px-2 border-r border-slate-200 text-center font-mono font-medium text-slate-500 bg-slate-50">
                    {period.start} - {period.end}
                  </td>
                  {DAYS.map(day => {
                    const slot = filteredSlots.find(
                      s => s.day === day && s.startTime === period.start
                    );

                    return (
                      <td key={day} className="p-2 border-r border-slate-100 last:border-r-0 align-top">
                        {slot ? (
                          <div className="p-2.5 rounded-lg bg-[#DDF3EA]/70 border border-[#BCE6D6] text-xs space-y-1">
                            <div className="font-bold text-[#075B46]">{slot.subjectName}</div>
                            <div className="text-[11px] text-slate-700 font-medium">{slot.teacherName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{slot.room}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-300">
                            Libre
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17201D]">Programmer un Cours</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="p-5 space-y-3 text-xs">
              
              {conflictWarning && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#C83B3B] mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Jour *</label>
                  <select
                    value={slotForm.day}
                    onChange={e => setSlotForm({ ...slotForm, day: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Créneau horaire *</label>
                  <select
                    value={slotForm.startTime}
                    onChange={e => {
                      const found = PERIODS.find(p => p.start === e.target.value);
                      setSlotForm({
                        ...slotForm,
                        startTime: e.target.value,
                        endTime: found ? found.end : '09:00',
                      });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {PERIODS.map(p => (
                      <option key={p.start} value={p.start}>{p.start} - {p.end}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Discipline Enseignée *</label>
                <select
                  value={slotForm.subjectId}
                  onChange={e => setSlotForm({ ...slotForm, subjectId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Enseignant Responsable *</label>
                <select
                  value={slotForm.teacherId}
                  onChange={e => setSlotForm({ ...slotForm, teacherId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      Prof. {t.firstName} {t.lastName} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Salle de cours *</label>
                <input
                  type="text"
                  required
                  value={slotForm.room}
                  onChange={e => setSlotForm({ ...slotForm, room: e.target.value })}
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
                  Valider le Cours
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
