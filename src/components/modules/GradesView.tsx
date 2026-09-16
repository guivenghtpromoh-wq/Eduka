/**
 * EDUKA - Gradebook & Assessment Management Module
 * Coefficient-weighted evaluations, grade entry, locking mechanisms,
 * and immutable audit trail for grade alterations.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  Award,
  Lock,
  Unlock,
  Plus,
  Save,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  X,
  AlertTriangle
} from 'lucide-react';
import { School, Assessment, Grade, AssessmentType, Subject, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/UIStates';
import { ParentGradesView } from './grades/ParentGradesView';
import { StudentGradesView } from './grades/StudentGradesView';

interface GradesViewProps {
  currentSchool: School;
  currentUser?: User;
  onNavigate?: (tab: any) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  currentSchool,
  currentUser,
  onNavigate,
}) => {
  // Role: Parent View
  if (currentUser?.role === 'parent') {
    return <ParentGradesView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  // Role: Student View
  if (currentUser?.role === 'eleve') {
    return <StudentGradesView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  const allClasses = useMemo(() => db.getClasses(currentSchool.id), [currentSchool.id]);
  const allSubjects = useMemo(() => db.getSubjects(currentSchool.id), [currentSchool.id]);

  const classes = useMemo(() => {
    if (currentUser?.role === 'enseignant') {
      return allClasses.filter(c => c.mainTeacherId === 'tch-001' || c.id === 'cls-001');
    }
    return allClasses;
  }, [allClasses, currentUser]);

  const subjects = useMemo(() => {
    if (currentUser?.role === 'enseignant') {
      return allSubjects.filter(s => s.code === 'MAT-NS1' || s.name.toLowerCase().includes('math'));
    }
    return allSubjects;
  }, [allSubjects, currentUser]);

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('ass-001');

  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    type: 'controle' as AssessmentType,
    maxScore: 100,
    weight: 2,
    period: 'Trimestre 1' as const,
    date: new Date().toISOString().split('T')[0],
  });

  const students = useMemo(() => {
    return db.getStudents(currentSchool.id).filter(s => s.currentClassId === selectedClassId);
  }, [currentSchool.id, selectedClassId]);

  const assessments = useMemo(() => {
    return db.getAssessments(currentSchool.id, selectedClassId);
  }, [currentSchool.id, selectedClassId]);

  const currentAssessment = useMemo(() => {
    return assessments.find(a => a.id === selectedAssessmentId) || assessments[0];
  }, [assessments, selectedAssessmentId]);

  // Scores state: studentId -> Grade object
  const [scoresMap, setScoresMap] = useState<Record<string, Grade>>(() => {
    const list = db.getGrades(selectedAssessmentId);
    const map: Record<string, Grade> = {};
    list.forEach(g => {
      map[g.studentId] = g;
    });
    return map;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const canValidate = auth.hasPermission('grades.validate');
  const canUpdate = auth.hasPermission('grades.update');

  // Switch assessment
  const handleSelectAssessment = (assId: string) => {
    setSelectedAssessmentId(assId);
    const list = db.getGrades(assId);
    const map: Record<string, Grade> = {};
    list.forEach(g => {
      map[g.studentId] = g;
    });
    setScoresMap(map);
  };

  const handleScoreChange = (studentId: string, scoreVal: number) => {
    if (currentAssessment?.status === 'locked' && !canValidate) {
      alert('Ces notes sont verrouillées. Seule la direction ou un administrateur peut les modifier.');
      return;
    }

    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        id: prev[studentId]?.id || `grd-${currentAssessment.id}-${studentId}`,
        assessmentId: currentAssessment.id,
        studentId,
        score: Number(scoreVal) || 0,
        comment: prev[studentId]?.comment || '',
        isLocked: currentAssessment.status === 'locked',
      }
    }));
  };

  const handleSaveGrades = () => {
    const gradesToSave: Grade[] = Object.values(scoresMap);
    db.saveGradesBatch(gradesToSave);

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'grades.update',
      resource: 'Assessment',
      resourceId: currentAssessment.id,
      details: `Enregistrement des notes pour "${currentAssessment.title}" (${gradesToSave.length} notes saisies)`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLockAssessment = () => {
    if (!canValidate) {
      alert('Votre profil ne dispose pas de la permission "grades.validate" requise.');
      return;
    }

    const userName = `${auth.getCurrentUser().firstName} ${auth.getCurrentUser().lastName}`;
    db.lockAssessmentGrades(currentAssessment.id, userName);

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'grades.lock',
      resource: 'Assessment',
      resourceId: currentAssessment.id,
      details: `Verrouillage officiel et publication des notes de "${currentAssessment.title}"`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    // Refresh assessment
    currentAssessment.status = 'locked';
    handleSelectAssessment(currentAssessment.id);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.title.trim()) return;

    const sub = subjects.find(s => s.id === selectedSubjectId);

    const newAss: Assessment = {
      id: `ass-${Date.now()}`,
      schoolId: currentSchool.id,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      subjectName: sub ? sub.name : 'Matière',
      title: assessmentForm.title.trim(),
      type: assessmentForm.type,
      maxScore: Number(assessmentForm.maxScore) || 100,
      weight: Number(assessmentForm.weight) || 2,
      period: assessmentForm.period,
      date: assessmentForm.date,
      status: 'draft',
      academicYearId: 'year-2024-2025',
      createdById: auth.getCurrentUser().id,
    };

    db.addAssessment(newAss);
    setSelectedAssessmentId(newAss.id);
    setIsNewAssessmentOpen(false);
  };

  // Calculate Class Average
  const scoresArray = students.map(s => scoresMap[s.id]?.score).filter(s => s !== undefined) as number[];
  const classAverage =
    scoresArray.length > 0
      ? Math.round((scoresArray.reduce((acc, curr) => acc + curr, 0) / scoresArray.length) * 10) / 10
      : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Cahier de Notes & Évaluations</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              Pondération Officielle
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Saisie des devoirs, contrôles, examens et verrouillage audité des résultats
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canUpdate && (
            <button
              type="button"
              onClick={() => setIsNewAssessmentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Évaluation</span>
            </button>
          )}

          {currentAssessment?.status !== 'locked' ? (
            <button
              type="button"
              onClick={handleSaveGrades}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Notes</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Notes Verrouillées</span>
            </div>
          )}

          {canValidate && currentAssessment?.status !== 'locked' && (
            <button
              type="button"
              onClick={handleLockAssessment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
              title="Verrouille l'évaluation pour publication officielle"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verrouiller pour Bulletin</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-[#DDF3EA] border border-[#BCE6D6] rounded-lg text-xs font-semibold text-[#075B46] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Notes enregistrées avec succès et archivées dans la base de données.</span>
        </div>
      )}

      {/* Selectors & KPI Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">Classe</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">Matière</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6]"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Coeff {s.coefficient})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17201D] mb-1">Évaluation active</label>
            <select
              value={currentAssessment?.id || ''}
              onChange={e => handleSelectAssessment(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-[#F5F7F6] font-medium"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.period}) - {a.status === 'locked' ? 'Verrouillé' : 'Saisie'}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Current Assessment Summary Info */}
        {currentAssessment && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-[#17201D]">{currentAssessment.title}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[#66736D]">Barème : sur {currentAssessment.maxScore}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[#66736D]">Coefficient : {currentAssessment.weight}</span>
              <span className="text-slate-400">•</span>
              <StatusBadge status={currentAssessment.status} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Moyenne de classe :</span>
              <span className="font-bold text-sm text-[#075B46]">{classAverage} / {currentAssessment.maxScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grade Entry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
              <tr>
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4">Nom et Prénom</th>
                <th className="py-3 px-4 w-32">Note (/ {currentAssessment?.maxScore || 100})</th>
                <th className="py-3 px-4">Appréciation / Observation</th>
                <th className="py-3 px-4">Statut Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => {
                const grade = scoresMap[student.id];
                const score = grade ? grade.score : '';
                const isLocked = currentAssessment?.status === 'locked';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-[#075B46]">
                      {student.matricule}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#17201D]">
                      {student.lastName.toUpperCase()}, {student.firstName}
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        min="0"
                        max={currentAssessment?.maxScore || 100}
                        disabled={isLocked && !canValidate}
                        value={score}
                        onChange={e => handleScoreChange(student.id, Number(e.target.value))}
                        className={`w-24 p-1.5 border rounded-md font-bold text-sm ${
                          isLocked
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-white text-[#17201D] border-slate-200 focus:border-[#075B46]'
                        }`}
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Observation pédagogique..."
                        disabled={isLocked && !canValidate}
                        value={grade?.comment || ''}
                        onChange={e => {
                          setScoresMap(prev => ({
                            ...prev,
                            [student.id]: {
                              id: prev[student.id]?.id || `grd-${currentAssessment.id}-${student.id}`,
                              assessmentId: currentAssessment.id,
                              studentId: student.id,
                              score: prev[student.id]?.score || 0,
                              comment: e.target.value,
                              isLocked: currentAssessment.status === 'locked'
                            }
                          }));
                        }}
                        className="w-full max-w-sm p-1.5 border border-slate-200 rounded-md text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Audité
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700">
                          Brouillon modifiable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Assessment Modal */}
      {isNewAssessmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17201D]">Nouvelle Évaluation</h3>
              <button
                type="button"
                onClick={() => setIsNewAssessmentOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Intitulé de l'évaluation *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Contrôle #2 : Trigonométrie"
                  value={assessmentForm.title}
                  onChange={e => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Type *</label>
                  <select
                    value={assessmentForm.type}
                    onChange={e => setAssessmentForm({ ...assessmentForm, type: e.target.value as AssessmentType })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="devoir">Devoir à la maison</option>
                    <option value="controle">Contrôle surveillé</option>
                    <option value="examen">Examen institutionnel</option>
                    <option value="projet">Projet de recherche</option>
                    <option value="participation">Participation orale</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Période *</label>
                  <select
                    value={assessmentForm.period}
                    onChange={e => setAssessmentForm({ ...assessmentForm, period: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Trimestre 1">Trimestre 1</option>
                    <option value="Trimestre 2">Trimestre 2</option>
                    <option value="Trimestre 3">Trimestre 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Barème (Max) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="1000"
                    value={assessmentForm.maxScore}
                    onChange={e => setAssessmentForm({ ...assessmentForm, maxScore: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Poids (Coefficient) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={assessmentForm.weight}
                    onChange={e => setAssessmentForm({ ...assessmentForm, weight: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Date de passation</label>
                <input
                  type="date"
                  value={assessmentForm.date}
                  onChange={e => setAssessmentForm({ ...assessmentForm, date: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewAssessmentOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] font-semibold"
                >
                  Créer l'Évaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
