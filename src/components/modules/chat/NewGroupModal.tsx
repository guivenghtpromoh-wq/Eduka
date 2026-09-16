/**
 * EDUKA - Create New Group Chat Modal
 * STRICT ENFORCEMENT: Students can ONLY create groups with peers
 * in the EXACT SAME CLASS.
 * PRIVACY GUARD: Only peer names are visible - NO phone, address, or financial info.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import { X, Users, Check, Shield, Search, AlertCircle } from 'lucide-react';
import { User, Student, Teacher, ChatConversation } from '../../../types';
import { db } from '../../../services/db';

interface NewGroupModalProps {
  currentUser: User;
  schoolId: string;
  onCreateGroup: (newConv: ChatConversation) => void;
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  currentUser,
  schoolId,
  onCreateGroup,
  onClose
}) => {
  const [groupTitle, setGroupTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('#075B46');

  const allStudents = useMemo(() => db.getStudents(schoolId), [schoolId]);
  const allTeachers = useMemo(() => db.getTeachers(schoolId), [schoolId]);

  // Current student record if currentUser is a student
  const currentStudentRecord = useMemo(() => {
    if (currentUser.role === 'eleve') {
      return allStudents.find(
        s => s.id === currentUser.id || s.email === currentUser.email || s.matricule === currentUser.matricule
      ) || allStudents[0]; // fallback to student #1 (Marc-Alain Célestin in class-ns1-a)
    }
    return null;
  }, [currentUser, allStudents]);

  // Eligible peers list based on STRICT role constraints:
  // - For ELEVE: ONLY students in the EXACT SAME CLASS!
  // - For ENSEIGNANT / ADMIN: eligible students or teachers
  const eligibleMembers = useMemo(() => {
    if (currentUser.role === 'eleve' && currentStudentRecord) {
      const studentClassId = currentStudentRecord.currentClassId;
      return allStudents
        .filter(s => s.currentClassId === studentClassId && s.id !== currentStudentRecord.id)
        .map(s => ({
          userId: s.id === 'stu-001' ? 'usr-eleve-celestin' : `usr-eleve-${s.id}`,
          name: `${s.firstName} ${s.lastName}`,
          role: 'eleve' as const,
          className: s.className,
          isClassmate: true
        }));
    } else if (currentUser.role === 'enseignant') {
      // Teachers can add their students or other teachers
      const teacherRecord = allTeachers.find(t => t.id === currentUser.id || t.email === currentUser.email) || allTeachers[0];
      const assignedClassIds = teacherRecord?.assignedClassIds || [];
      const classStudents = allStudents
        .filter(s => assignedClassIds.includes(s.currentClassId))
        .map(s => ({
          userId: s.id === 'stu-001' ? 'usr-eleve-celestin' : `usr-eleve-${s.id}`,
          name: `${s.firstName} ${s.lastName}`,
          role: 'eleve' as const,
          className: s.className,
          isClassmate: false
        }));

      const colleagues = allTeachers
        .filter(t => t.id !== currentUser.id)
        .map(t => ({
          userId: `usr-teacher-${t.id}`,
          name: `${t.firstName} ${t.lastName} (${t.specialty.split('&')[0].trim()})`,
          role: 'enseignant' as const,
          className: 'Corps Enseignant',
          isClassmate: false
        }));

      return [...classStudents, ...colleagues];
    } else {
      // Admins & direction
      return allStudents.map(s => ({
        userId: s.id === 'stu-001' ? 'usr-eleve-celestin' : `usr-eleve-${s.id}`,
        name: `${s.firstName} ${s.lastName}`,
        role: 'eleve' as const,
        className: s.className,
        isClassmate: false
      }));
    }
  }, [currentUser, currentStudentRecord, allStudents, allTeachers]);

  // Filtered by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return eligibleMembers;
    const q = searchQuery.toLowerCase();
    return eligibleMembers.filter(m => m.name.toLowerCase().includes(q));
  }, [eligibleMembers, searchQuery]);

  const toggleSelect = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || selectedUserIds.length === 0) return;

    const participantIds = [currentUser.id, ...selectedUserIds];
    const participantNames: Record<string, string> = {
      [currentUser.id]: `${currentUser.firstName} ${currentUser.lastName}`
    };

    selectedUserIds.forEach(id => {
      const found = eligibleMembers.find(m => m.userId === id);
      if (found) {
        participantNames[id] = found.name;
      }
    });

    const newConv: ChatConversation = {
      id: `conv-group-${Date.now()}`,
      schoolId,
      type: 'group',
      title: groupTitle.trim(),
      participantIds,
      participantNames,
      classId: currentStudentRecord?.currentClassId,
      className: currentStudentRecord?.className,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'active',
      isGroup: true,
      avatarColor: selectedColor,
      lastMessage: {
        content: `Groupe créé par ${currentUser.firstName} ${currentUser.lastName}`,
        sentAt: new Date().toISOString(),
        senderName: 'Système',
        type: 'text'
      }
    };

    db.addConversation(newConv);
    onCreateGroup(newConv);
    onClose();
  };

  const COLOR_OPTIONS = ['#075B46', '#2563EB', '#D97706', '#7C3AED', '#DC2626', '#0891B2'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#075B46] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kreye yon Nouvo Gwoup</h3>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'eleve'
                  ? `Klas ou : ${currentStudentRecord?.className || 'Nouveau Secondaire 1'}`
                  : 'Salon de discussion et d\'étude'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Privacy Banner */}
        <div className="bg-emerald-50/60 border-b border-emerald-100/80 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <Shield className="w-4 h-4 text-[#075B46] shrink-0" />
          <span>
            {currentUser.role === 'eleve' ? (
              <strong>Sekirite Klas:</strong>
            ) : (
              <strong>Politique de confidentialité:</strong>
            )}{' '}
            {currentUser.role === 'eleve'
              ? 'Ou ka sèlman ajoute kamarad ki nan menm klas avè w. Yo wè sèlman non w ak klas la.'
              : 'Seuls les membres autorisés de l\'établissement ont accès à ce salon.'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Group Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Non Gwoup la *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Gwoup Etid Matematik NS1-A"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] focus:border-transparent"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Koulè Gwoup la
            </label>
            <div className="flex items-center space-x-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Members Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Chwazi Kamarad Klas yo ({selectedUserIds.length} chwazi) *
              </label>
              <span className="text-[11px] text-slate-500">
                {eligibleMembers.length} kamarad disponib
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Chèche yon kamarad klas pa non..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46]"
              />
            </div>

            {/* Members List */}
            <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Okenn kamarad pa jwenn pou rechèch sa a.
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedUserIds.includes(member.userId);
                  return (
                    <div
                      key={member.userId}
                      onClick={() => toggleSelect(member.userId)}
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                          {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-500">{member.className}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#075B46] border-[#075B46] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Anile
            </button>
            <button
              type="submit"
              disabled={!groupTitle.trim() || selectedUserIds.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#064e3b] disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kreye Gwoup la</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
