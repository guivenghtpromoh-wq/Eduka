/**
 * EDUKA - Attendance & Fast Roll Call Module
 * High-speed roll call optimized for mobile touchscreen and desktop.
 * Offline-first: records are immediately committed locally and queued for background sync.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  HelpCircle,
  Save,
  CheckCircle2,
  Filter,
  Users,
  AlertCircle
} from 'lucide-react';
import { School, AttendanceStatus, AttendanceRecord, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { syncEngine } from '../../services/sync';
import { StatusBadge } from '../common/UIStates';
import { ParentAttendanceView } from './attendance/ParentAttendanceView';

interface AttendanceViewProps {
  currentSchool: School;
  currentUser?: User;
  onNavigate?: (tab: any) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  // Role: Parent View
  if (currentUser?.role === 'parent') {
    return <ParentAttendanceView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  // Role: Student View
  if (currentUser?.role === 'eleve') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#075B46] uppercase tracking-wider">
              Espace Élève
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17201D] mt-1">
              Mon Assiduité en Classe
            </h1>
            <p className="text-xs text-[#66736D] mt-1">
              Relevé de mes présences, absences et ponctualité pour l'année 2024-2025
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 text-xs font-bold bg-[#DDF3EA] text-[#075B46] rounded-lg">
              Taux Global : 98%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-[#66736D]">Jours de Présence</span>
            <div className="text-2xl font-bold text-[#075B46] mt-1">24 jours</div>
            <span className="text-[11px] text-[#66736D]">Sur 25 séances obligatoires</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-[#66736D]">Absence Justifiée</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">1 jour</div>
            <span className="text-[11px] text-[#66736D]">Certificat médical fourni</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-[#66736D]">Retards Signalés</span>
            <div className="text-2xl font-bold text-[#17201D] mt-1">0 min</div>
            <span className="text-[11px] text-emerald-700">Ponctualité exemplaire</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#17201D]">Historique Récents des Appels</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Mercredi 20 Novembre 2024</span>
                <div className="text-slate-500">Matin & Après-midi • Salle 201</div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
                Présent(e)
              </span>
            </div>
            <div className="p-3 bg-[#F5F7F6] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Mardi 19 Novembre 2024</span>
                <div className="text-slate-500">Maladie justifiée par certificat</div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                Absence Justifiée
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allClasses = useMemo(() => db.getClasses(currentSchool.id), [currentSchool.id]);
  // If teacher, show only their classes
  const classes = useMemo(() => {
    if (currentUser?.role === 'enseignant') {
      return allClasses.filter(c => c.mainTeacherId === 'tch-001' || c.id === 'cls-001');
    }
    return allClasses;
  }, [allClasses, currentUser]);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<'morning' | 'afternoon'>('morning');

  const studentsInClass = useMemo(() => {
    return db.getStudents(currentSchool.id).filter(s => s.currentClassId === selectedClassId);
  }, [currentSchool.id, selectedClassId]);

  // Attendance state map: studentId -> AttendanceStatus
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; lateMinutes?: number; note?: string }>>(() => {
    const existing = db.getAttendance(currentSchool.id, classes[0]?.id, new Date().toISOString().split('T')[0]);
    const map: Record<string, { status: AttendanceStatus; lateMinutes?: number; note?: string }> = {};
    existing.forEach(r => {
      map[r.studentId] = { status: r.status, lateMinutes: r.lateMinutes, note: r.justificationReason };
    });
    return map;
  });

  const [savedNotification, setSavedNotification] = useState(false);

  // Switch class or date: load from DB
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const existing = db.getAttendance(currentSchool.id, classId, selectedDate);
    const map: Record<string, { status: AttendanceStatus; lateMinutes?: number; note?: string }> = {};
    existing.forEach(r => {
      map[r.studentId] = { status: r.status, lateMinutes: r.lateMinutes, note: r.justificationReason };
    });
    setAttendanceMap(map);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const existing = db.getAttendance(currentSchool.id, selectedClassId, date);
    const map: Record<string, { status: AttendanceStatus; lateMinutes?: number; note?: string }> = {};
    existing.forEach(r => {
      map[r.studentId] = { status: r.status, lateMinutes: r.lateMinutes, note: r.justificationReason };
    });
    setAttendanceMap(map);
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus }> = {};
    studentsInClass.forEach(s => {
      updated[s.id] = { status: 'present' };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = () => {
    const records: AttendanceRecord[] = studentsInClass.map(s => {
      const data = attendanceMap[s.id] || { status: 'present' };
      return {
        id: `att-${s.id}-${selectedDate}-${period}`,
        schoolId: currentSchool.id,
        classId: selectedClassId,
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        date: selectedDate,
        period,
        status: data.status,
        lateMinutes: data.lateMinutes,
        justificationReason: data.note,
        recordedByUserId: auth.getCurrentUser().id,
        recordedAt: new Date().toISOString(),
        synced: syncEngine.isOnline(),
      };
    });

    db.saveAttendanceBatch(records);
    syncEngine.enqueue('attendance_record', records, auth.getCurrentUser().id);

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'attendance.record',
      resource: 'Attendance',
      details: `Enregistrement de l'appel pour la classe ${selectedClassId} (${records.length} élèves pointés)`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Stats calculation
  const total = studentsInClass.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  studentsInClass.forEach(s => {
    const st = attendanceMap[s.id]?.status || 'present';
    if (st === 'present') presentCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'late') lateCount++;
    else if (st === 'excused') excusedCount++;
  });

  const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Gestion des Présences & Appel Rapide</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              Mode Offline-First
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Pointage rapide sur tablette/mobile • Sauvegarde locale instantanée garantie sans perte
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            Tous présents
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer l'Appel</span>
          </button>
        </div>
      </div>

      {/* Confirmation Notification Banner */}
      {savedNotification && (
        <div className="p-3 bg-[#DDF3EA] border border-[#BCE6D6] rounded-lg text-xs font-semibold text-[#075B46] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Appel enregistré localement avec succès dans le journal de bord de l'établissement !</span>
          </div>
          <span className="text-[11px] text-emerald-800">Horodaté à {new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* Selectors & KPI bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">Classe</label>
            <select
              value={selectedClassId}
              onChange={e => handleClassChange(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6] font-medium"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.room})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">Créneau</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as 'morning' | 'afternoon')}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6]"
            >
              <option value="morning">Matinée (08:00 - 12:00)</option>
              <option value="afternoon">Après-midi (13:00 - 16:30)</option>
            </select>
          </div>

        </div>

        {/* Real-time Roll-Call KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Effectif</span>
            <div className="text-base font-bold text-[#17201D]">{total}</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold">Présents</span>
            <div className="text-base font-bold text-[#075B46]">{presentCount}</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg border border-red-200">
            <span className="text-[10px] text-red-800 uppercase font-semibold">Absents</span>
            <div className="text-base font-bold text-[#C83B3B]">{absentCount}</div>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-800 uppercase font-semibold">En retard</span>
            <div className="text-base font-bold text-[#D9822B]">{lateCount}</div>
          </div>
          <div className="p-2 bg-[#DDF3EA] rounded-lg">
            <span className="text-[10px] text-[#075B46] uppercase font-semibold">Taux d'assiduité</span>
            <div className="text-base font-bold text-[#075B46]">{rate}%</div>
          </div>
        </div>
      </div>

      {/* Roster Touch Roll Call List */}
      <div className="space-y-2">
        {studentsInClass.map(student => {
          const currentStatus = attendanceMap[student.id]?.status || 'present';

          return (
            <div
              key={student.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-slate-300"
            >
              {/* Student info */}
              <div>
                <div className="text-xs font-mono font-medium text-[#075B46]">
                  {student.matricule}
                </div>
                <div className="text-sm font-bold text-[#17201D] mt-0.5">
                  {student.lastName.toUpperCase()}, {student.firstName}
                </div>
              </div>

              {/* Status Selector Buttons (Designed for Touch min 44px height) */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Present */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'present')}
                  className={`flex-1 sm:flex-initial min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    currentStatus === 'present'
                      ? 'bg-[#075B46] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Présent</span>
                </button>

                {/* Absent */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'absent')}
                  className={`flex-1 sm:flex-initial min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    currentStatus === 'absent'
                      ? 'bg-[#C83B3B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Absent</span>
                </button>

                {/* Retard */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'late')}
                  className={`flex-1 sm:flex-initial min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    currentStatus === 'late'
                      ? 'bg-[#D9822B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Retard</span>
                </button>

                {/* Justifié */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'excused')}
                  className={`flex-1 sm:flex-initial min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    currentStatus === 'excused'
                      ? 'bg-[#0B8064] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Justifié</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
