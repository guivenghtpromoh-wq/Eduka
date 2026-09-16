/**
 * EDUKA - New Direct Conversation & Message Request Modal
 * STRICT ENFORCEMENT:
 * - Students can ONLY see peers in the EXACT SAME CLASS and their assigned teachers.
 * - PRIVACY: Only full name and class are visible (NO phone, address, parents info).
 * - MESSAGE REQUEST WORKFLOW: First interaction requires sending a request
 *   which the other peer accepts or declines.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import { X, MessageSquare, Send, Shield, Search, UserCheck } from 'lucide-react';
import { User, Student, Teacher, ChatConversation, MessageRequest } from '../../../types';
import { db } from '../../../services/db';

interface NewDirectChatModalProps {
  currentUser: User;
  schoolId: string;
  onSelectExistingConversation: (conv: ChatConversation) => void;
  onRequestSent: (req: MessageRequest) => void;
  onClose: () => void;
}

export const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  currentUser,
  schoolId,
  onSelectExistingConversation,
  onRequestSent,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string;
    name: string;
    role: 'eleve' | 'enseignant' | 'direction';
    className?: string;
  } | null>(null);
  const [requestNote, setRequestNote] = useState('');

  const allStudents = useMemo(() => db.getStudents(schoolId), [schoolId]);
  const allTeachers = useMemo(() => db.getTeachers(schoolId), [schoolId]);
  const existingConversations = useMemo(() => db.getConversations(schoolId, currentUser.id), [schoolId, currentUser.id]);

  // Current student profile
  const currentStudentRecord = useMemo(() => {
    if (currentUser.role === 'eleve') {
      return allStudents.find(
        s => s.id === currentUser.id || s.email === currentUser.email || s.matricule === currentUser.matricule
      ) || allStudents[0];
    }
    return null;
  }, [currentUser, allStudents]);

  // Eligible targets:
  // - Students: ONLY classmates in the same class + class teachers
  // - Teachers: students in their classes + colleagues
  const eligibleTargets = useMemo(() => {
    if (currentUser.role === 'eleve' && currentStudentRecord) {
      const studentClassId = currentStudentRecord.currentClassId;

      // Classmates ONLY
      const classmates = allStudents
        .filter(s => s.currentClassId === studentClassId && s.id !== currentStudentRecord.id)
        .map(s => ({
          id: s.id === 'stu-001' ? 'usr-eleve-celestin' : `usr-eleve-${s.id}`,
          name: `${s.firstName} ${s.lastName}`,
          role: 'eleve' as const,
          className: s.className
        }));

      // Assigned Teachers
      const teachers = allTeachers
        .filter(t => t.assignedClassIds.includes(studentClassId))
        .map(t => ({
          id: 'usr-prof-etienne',
          name: `${t.firstName} ${t.lastName}`,
          role: 'enseignant' as const,
          className: `Professeur (${t.specialty.split('&')[0].trim()})`
        }));

      return [...classmates, ...teachers];
    } else if (currentUser.role === 'enseignant') {
      const teacherRecord = allTeachers.find(t => t.id === currentUser.id || t.email === currentUser.email) || allTeachers[0];
      const assignedClassIds = teacherRecord?.assignedClassIds || [];

      const students = allStudents
        .filter(s => assignedClassIds.includes(s.currentClassId))
        .map(s => ({
          id: s.id === 'stu-001' ? 'usr-eleve-celestin' : `usr-eleve-${s.id}`,
          name: `${s.firstName} ${s.lastName}`,
          role: 'eleve' as const,
          className: s.className
        }));

      const colleagues = allTeachers
        .filter(t => t.id !== currentUser.id)
        .map(t => ({
          id: `usr-teacher-${t.id}`,
          name: `${t.firstName} ${t.lastName}`,
          role: 'enseignant' as const,
          className: `Professeur (${t.specialty.split('&')[0].trim()})`
        }));

      return [...students, ...colleagues];
    } else {
      return allStudents.map(s => ({
        id: s.id === 'stu-001' ? 'usr-eleve-celestin' : `usr-eleve-${s.id}`,
        name: `${s.firstName} ${s.lastName}`,
        role: 'eleve' as const,
        className: s.className
      }));
    }
  }, [currentUser, currentStudentRecord, allStudents, allTeachers]);

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return eligibleTargets;
    const q = searchQuery.toLowerCase();
    return eligibleTargets.filter(t => t.name.toLowerCase().includes(q));
  }, [eligibleTargets, searchQuery]);

  const handleSelect = (target: typeof eligibleTargets[0]) => {
    // Check if an active direct conversation already exists
    const existing = existingConversations.find(
      c => c.type === 'direct' && c.participantIds.includes(target.id)
    );

    if (existing) {
      onSelectExistingConversation(existing);
      onClose();
      return;
    }

    setSelectedTarget(target);
    setRequestNote(
      currentUser.role === 'eleve'
        ? `Salut ${target.name.split(' ')[0]}! Mwen nan menm klas avè w, èske nou ka pale sou devwa ak kou yo?`
        : `Bonjour ${target.name}, je vous contacte concernant le suivi des cours.`
    );
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    // If target is teacher, open conversation directly
    if (selectedTarget.role === 'enseignant' || currentUser.role === 'enseignant' || currentUser.role === 'admin' || currentUser.role === 'direction') {
      const newConv: ChatConversation = {
        id: `conv-direct-${currentUser.id}-${selectedTarget.id}`,
        schoolId,
        type: 'direct',
        title: selectedTarget.name,
        participantIds: [currentUser.id, selectedTarget.id],
        participantNames: {
          [currentUser.id]: `${currentUser.firstName} ${currentUser.lastName}`,
          [selectedTarget.id]: selectedTarget.name
        },
        classId: currentStudentRecord?.currentClassId,
        className: currentStudentRecord?.className,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        status: 'active',
        isGroup: false,
        avatarColor: '#075B46',
        lastMessage: {
          content: requestNote.trim() || 'Conversation initiée',
          sentAt: new Date().toISOString(),
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          type: 'text'
        }
      };
      db.addConversation(newConv);
      db.addMessage({
        id: `msg-direct-init-${Date.now()}`,
        conversationId: newConv.id,
        schoolId,
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: currentUser.role,
        type: 'text',
        content: requestNote.trim() || 'Conversation initiée',
        sentAt: new Date().toISOString(),
        readBy: [currentUser.id]
      });
      onSelectExistingConversation(newConv);
      onClose();
      return;
    }

    // Student-to-Student: creates a formal MessageRequest
    const newReq: MessageRequest = {
      id: `req-${Date.now()}`,
      schoolId,
      fromUserId: currentUser.id,
      fromUserName: `${currentUser.firstName} ${currentUser.lastName}`,
      fromUserRole: currentUser.role,
      toUserId: selectedTarget.id,
      toUserName: selectedTarget.name,
      toUserRole: selectedTarget.role,
      classId: currentStudentRecord?.currentClassId || 'class-ns1-a',
      className: currentStudentRecord?.className || 'Nouveau Secondaire 1 (NS1-A)',
      initialMessage: requestNote.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.addMessageRequest(newReq);
    onRequestSent(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#075B46] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nouvo Diskisyon Dirèk</h3>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'eleve'
                  ? 'Kominike ak yon kamarad klas oswa yon pwofesè'
                  : 'Démarrer une conversation individuelle'}
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

        {/* Privacy Note */}
        <div className="bg-emerald-50/60 border-b border-emerald-100/80 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <Shield className="w-4 h-4 text-[#075B46] shrink-0" />
          <span>
            {currentUser.role === 'eleve' ? (
              <strong>Konfidansyalite Pwoteje:</strong>
            ) : (
              <strong>Politique de communication:</strong>
            )}{' '}
            {currentUser.role === 'eleve'
              ? 'Ou ka wè sèlman moun ki nan menm klas avè w. Yo pa wè nimewo telefòn ou ni enfòmasyon pèsonèl ou.'
              : 'Les échanges sont encadrés par la charte de correspondance scolaire.'}
          </span>
        </div>

        {/* Step 1: Select person */}
        {!selectedTarget ? (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={
                  currentUser.role === 'eleve'
                    ? 'Chèche yon kamarad nan klas ou oswa yon pwofesè...'
                    : 'Rechercher un élève ou un collègue...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46]"
              />
            </div>

            {/* List */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {filteredTargets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Okenn moun pa jwenn nan klas ou a.
                </div>
              ) : (
                filteredTargets.map((target) => (
                  <div
                    key={target.id}
                    onClick={() => handleSelect(target)}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        target.role === 'enseignant' ? 'bg-[#D97706]' : 'bg-[#075B46]'
                      }`}>
                        {target.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{target.name}</p>
                        <p className="text-[11px] text-slate-500">{target.className}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-[#075B46] flex items-center gap-1 hover:underline">
                      <span>Chwazi</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Message Request Form */
          <form onSubmit={handleSendRequest} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  selectedTarget.role === 'enseignant' ? 'bg-[#D97706]' : 'bg-[#075B46]'
                }`}>
                  {selectedTarget.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">{selectedTarget.name}</p>
                  <p className="text-[10px] text-slate-500">{selectedTarget.className}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="text-xs text-[#075B46] font-semibold hover:underline"
              >
                Chanje
              </button>
            </div>

            {currentUser.role === 'eleve' && selectedTarget.role === 'eleve' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Demann Mesaj :</strong> Kamarad la ap resevwa yon demann nan bwat mesaj li a. Depi li aksepte l, nou de ap ka chat lib, fè apèl videyo, voye vokal ak nòt.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Premye Mesaj oswa Rezon Demann lan *
              </label>
              <textarea
                required
                rows={4}
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="Ekri yon ti mesaj pou kòmanse..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Retounen
              </button>
              <button
                type="submit"
                disabled={!requestNote.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#064e3b] disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {currentUser.role === 'eleve' && selectedTarget.role === 'eleve'
                    ? 'Voye Demann Mesaj'
                    : 'Ouvri Diskisyon'}
                </span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
