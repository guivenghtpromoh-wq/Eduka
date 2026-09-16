/**
 * EDUKA - Integrated Communication & Academic Messaging Engine
 * 
 * STRICT COMPLIANCE:
 * 1. Peer-to-Peer & Group Messaging with Role & Class Isolation.
 * 2. Students can ONLY view & create groups with peers in the EXACT SAME CLASS.
 * 3. Privacy: Students see ONLY the name and class of their peers (NO phone, address, or parents).
 * 4. Message Request System ("Demann Mesaj"): requires acceptance before direct messaging.
 * 5. Full Multi-Media Support:
 *    - Voice audio notes recording & playback (Voye voice).
 *    - Photo sharing with full-size lightbox preview (Voye photo).
 *    - Academic notes & homework sharing (Voye nòt).
 *    - Interactive Live Video Calls with WebRTC camera, mic & screen share (Apèl videyo).
 * 6. Institutional Official Announcements & Alerts Broadcast.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Megaphone,
  Plus,
  Users,
  Search,
  Shield,
  Video,
  Clock,
  Mic,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  UserCheck,
  Radio,
  Send
} from 'lucide-react';
import {
  School,
  User,
  ChatConversation,
  MessageRequest,
  CommunicationAnnouncement,
  ChannelType
} from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { ChatArea } from './chat/ChatArea';
import { NewGroupModal } from './chat/NewGroupModal';
import { NewDirectChatModal } from './chat/NewDirectChatModal';
import { VideoCallModal } from './chat/VideoCallModal';
import { MessageRequestsPanel } from './chat/MessageRequestsPanel';

interface CommunicationViewProps {
  currentSchool: School;
  currentUser?: User;
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({
  currentSchool,
  currentUser: propUser
}) => {
  const currentUser = propUser || auth.getCurrentUser();

  // Primary Tab: 'chat' (Interactive Messaging) or 'announcements' (Official Broadcasts)
  const [activeMainTab, setActiveMainTab] = useState<'chat' | 'announcements'>('chat');

  // Conversations & Requests State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);

  // Filter & Search in Chat Sidebar
  const [chatCategory, setChatCategory] = useState<'all' | 'groups' | 'direct' | 'requests'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState<ChatConversation | null>(null);

  // Official Announcements state
  const [announcements, setAnnouncements] = useState<CommunicationAnnouncement[]>([]);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    content: '',
    channel: 'in_app' as ChannelType,
    targetRole: 'all',
    isUrgent: false,
  });

  // Load conversations & requests on mount and school change
  useEffect(() => {
    const convs = db.getConversations(currentSchool.id, currentUser.id);
    setConversations(convs);

    const reqs = db.getMessageRequests(currentSchool.id, currentUser.id);
    setMessageRequests(reqs);

    const anns = db.getAnnouncements(currentSchool.id);
    setAnnouncements(anns);

    // Auto-select first conversation if available on desktop
    if (convs.length > 0 && !selectedConversation && window.innerWidth >= 1024) {
      setSelectedConversation(convs[0]);
    }
  }, [currentSchool.id, currentUser.id]);

  // Pending requests count
  const pendingRequestsCount = useMemo(() => {
    return messageRequests.filter(r => r.status === 'pending').length;
  }, [messageRequests]);

  // Filter conversations based on category and search
  const filteredConversations = useMemo(() => {
    let list = conversations;

    if (chatCategory === 'groups') {
      list = list.filter(c => c.isGroup);
    } else if (chatCategory === 'direct') {
      list = list.filter(c => !c.isGroup);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        c =>
          c.title?.toLowerCase().includes(q) ||
          c.lastMessage?.content.toLowerCase().includes(q) ||
          c.className?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [conversations, chatCategory, searchFilter]);

  // Student class info for privacy badge
  const studentClassBadge = useMemo(() => {
    if (currentUser.role === 'eleve') {
      const allStudents = db.getStudents(currentSchool.id);
      const student = allStudents.find(
        s => s.id === currentUser.id || s.email === currentUser.email || s.matricule === currentUser.matricule
      ) || allStudents[0];
      return student?.className || 'Nouveau Secondaire 1 (NS1-A)';
    }
    return null;
  }, [currentUser, currentSchool.id]);

  const handleGroupCreated = (newConv: ChatConversation) => {
    setConversations(db.getConversations(currentSchool.id, currentUser.id));
    setSelectedConversation(newConv);
  };

  const handleRequestSent = (req: MessageRequest) => {
    setMessageRequests(db.getMessageRequests(currentSchool.id, currentUser.id));
  };

  const handleRequestHandled = (updatedReq: MessageRequest, openedConv?: ChatConversation) => {
    setMessageRequests(db.getMessageRequests(currentSchool.id, currentUser.id));
    setConversations(db.getConversations(currentSchool.id, currentUser.id));
    if (openedConv) {
      setSelectedConversation(openedConv);
      setChatCategory('all');
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastData.title.trim() || !broadcastData.content.trim()) return;

    const newAnn: CommunicationAnnouncement = {
      id: `ann-${Date.now()}`,
      schoolId: currentSchool.id,
      title: broadcastData.title.trim(),
      content: broadcastData.content.trim(),
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      authorRole: currentUser.role,
      channel: broadcastData.channel,
      targetRole: broadcastData.targetRole,
      createdAt: new Date().toISOString(),
      isUrgent: broadcastData.isUrgent,
      recipientCount: broadcastData.targetRole === 'all' ? 142 : 45,
    };

    db.addAnnouncement(newAnn);
    db.addAuditLog({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      schoolId: currentSchool.id,
      action: 'communication.broadcast',
      resource: 'Announcement',
      resourceId: newAnn.id,
      details: `Diffusion institutionnelle "${newAnn.title}" via ${newAnn.channel} (${newAnn.recipientCount} destinataires)`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setAnnouncements(db.getAnnouncements(currentSchool.id));
    setIsNewAnnouncementOpen(false);
  };

  const canBroadcast = auth.hasPermission('messages.send') && currentUser.role !== 'eleve';

  return (
    <div className="space-y-4">
      
      {/* Module Navigation Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMainTab('chat')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'chat'
                ? 'bg-white text-[#075B46] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mesaj & Salons de Classe</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('announcements')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'announcements'
                ? 'bg-white text-[#075B46] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Annonces & Alertes Officielles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
              {announcements.length}
            </span>
          </button>
        </div>

        {/* Status / Role Indicator */}
        <div className="flex items-center space-x-3 text-xs text-slate-500 px-2">
          {studentClassBadge ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-3 py-1.5 rounded-xl font-semibold">
              <Shield className="w-3.5 h-3.5 text-[#075B46]" />
              <span>Klas ou : {studentClassBadge}</span>
            </div>
          ) : (
            <span className="font-medium text-slate-600">
              {currentSchool.name}
            </span>
          )}
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CHAT & CLASS SALONS */}
      {activeMainTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[calc(100vh-210px)] min-h-[580px] flex">
          
          {/* Left Sidebar: Conversations & Requests */}
          <div
            className={`w-full lg:w-80 xl:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
              selectedConversation && chatCategory !== 'requests' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Sidebar Top Action Bar */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Diskisyon & Gwoup</h2>
                
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(true)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-[#075B46] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Kreye yon nouvo gwoup klas"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Kreye Gwoup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDirectModalOpen(true)}
                    className="p-2 bg-[#075B46] hover:bg-[#064e3b] text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Nouvo mesaj dirèk"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Nouvo Mesaj</span>
                  </button>
                </div>
              </div>

              {/* Student Class Isolation Notice */}
              {currentUser.role === 'eleve' && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#075B46] shrink-0 mt-0.5" />
                  <span>
                    <strong>Sekirite Klas:</strong> Ou ka sèlman pale ak moun ki nan menm klas avè w. Yo pa wè enfo prive w.
                  </span>
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Chèche yon gwoup oswa yon kamarad..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] bg-slate-50"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 pt-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setChatCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    chatCategory === 'all'
                      ? 'bg-[#075B46] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tout
                </button>
                <button
                  type="button"
                  onClick={() => setChatCategory('groups')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    chatCategory === 'groups'
                      ? 'bg-[#075B46] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Gwoup Klas
                </button>
                <button
                  type="button"
                  onClick={() => setChatCategory('direct')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    chatCategory === 'direct'
                      ? 'bg-[#075B46] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dirèk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatCategory('requests');
                    setSelectedConversation(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                    chatCategory === 'requests'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Demann</span>
                  {pendingRequestsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {chatCategory === 'requests' ? (
                <div className="p-4">
                  <MessageRequestsPanel
                    requests={messageRequests}
                    onRequestHandled={handleRequestHandled}
                  />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <p>Okenn diskisyon pa jwenn.</p>
                  <button
                    type="button"
                    onClick={() => setIsDirectModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-[#075B46] hover:underline"
                  >
                    Kòmanse yon nouvo mesaj
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        if (chatCategory === 'requests') setChatCategory('all');
                      }}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-l-[#075B46]'
                          : 'hover:bg-white'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: conv.avatarColor || '#075B46' }}
                      >
                        {conv.isGroup ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          conv.title?.split(' ').map(n => n[0]).slice(0, 2).join('')
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.title}
                          </h4>
                          {conv.lastMessage?.sentAt && (
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                              {new Date(conv.lastMessage.sentAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>

                        {/* Last message preview */}
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 truncate">
                          {conv.lastMessage?.type === 'voice' && (
                            <>
                              <Mic className="w-3 h-3 text-[#075B46] shrink-0" />
                              <span className="italic">Mesaj vokal</span>
                            </>
                          )}
                          {conv.lastMessage?.type === 'image' && (
                            <>
                              <ImageIcon className="w-3 h-3 text-[#075B46] shrink-0" />
                              <span className="italic">Foto</span>
                            </>
                          )}
                          {conv.lastMessage?.type === 'note' && (
                            <>
                              <FileText className="w-3 h-3 text-[#075B46] shrink-0" />
                              <span className="italic font-medium">{conv.lastMessage.content}</span>
                            </>
                          )}
                          {(!conv.lastMessage?.type || conv.lastMessage?.type === 'text') && (
                            <span className="truncate">
                              {conv.lastMessage?.senderName ? `${conv.lastMessage.senderName.split(' ')[0]}: ` : ''}
                              {conv.lastMessage?.content || 'Nouvo diskisyon'}
                            </span>
                          )}
                        </div>

                        {/* Class Tag if group */}
                        {conv.className && conv.isGroup && (
                          <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                            {conv.className}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Chat Window */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            {chatCategory === 'requests' ? (
              <div className="p-6 overflow-y-auto max-w-4xl mx-auto w-full">
                <MessageRequestsPanel
                  requests={messageRequests}
                  onRequestHandled={handleRequestHandled}
                />
              </div>
            ) : selectedConversation ? (
              <ChatArea
                conversation={selectedConversation}
                currentUser={currentUser}
                onBack={() => setSelectedConversation(null)}
                onStartVideoCall={(conv) => setActiveVideoCall(conv)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#075B46] flex items-center justify-center mb-4 shadow-xs">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Espas Kominikasyon Klas & Gwoup Etid
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1 mb-5">
                  Chwazi yon diskisyon sou bò gòch la oswa kreye yon gwoup pou etidye ak kamarad klas ou yo.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(true)}
                    className="px-4 py-2 bg-[#075B46] hover:bg-[#064e3b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Kreye Gwoup Klas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDirectModalOpen(true)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvo Mesaj Dirèk</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: OFFICIAL INSTITUTIONAL ANNOUNCEMENTS */}
      {activeMainTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#17201D]">Diffusions & Alertes Officielles</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
                  Passerelle Institutionnelle
                </span>
              </div>
              <p className="text-xs text-[#66736D] mt-1">
                Communications descendantes certifiées par la Direction et le Corps Enseignant
              </p>
            </div>

            {canBroadcast && (
              <button
                type="button"
                onClick={() => setIsNewAnnouncementOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Diffuser une Communication</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className={`p-5 rounded-xl border shadow-2xs space-y-3 bg-white ${
                  ann.isUrgent ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    {ann.isUrgent ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C83B3B] text-white rounded uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Alerte Urgente
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#DDF3EA] text-[#075B46] rounded uppercase">
                        Information Officielle
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">Canal : {ann.channel.toUpperCase()}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">Cible : {ann.targetRole}</span>
                  </div>

                  <span className="text-xs text-[#66736D]">
                    {new Date(ann.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })} à {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#17201D]">{ann.title}</h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#66736D]">
                  <span>Émis par : <strong>{ann.authorName}</strong> ({ann.authorRole})</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Délivré à {ann.recipientCount} destinataires
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE GROUP CHAT */}
      {isGroupModalOpen && (
        <NewGroupModal
          currentUser={currentUser}
          schoolId={currentSchool.id}
          onCreateGroup={handleGroupCreated}
          onClose={() => setIsGroupModalOpen(false)}
        />
      )}

      {/* MODAL: NEW DIRECT CHAT / MESSAGE REQUEST */}
      {isDirectModalOpen && (
        <NewDirectChatModal
          currentUser={currentUser}
          schoolId={currentSchool.id}
          onSelectExistingConversation={(conv) => {
            setSelectedConversation(conv);
            setChatCategory('all');
          }}
          onRequestSent={handleRequestSent}
          onClose={() => setIsDirectModalOpen(false)}
        />
      )}

      {/* MODAL: LIVE VIDEO CALL */}
      {activeVideoCall && (
        <VideoCallModal
          roomTitle={activeVideoCall.title || 'Salon Vidéo EDUKA'}
          currentUser={currentUser}
          participants={activeVideoCall.participantIds.map(id => ({
            id,
            name: activeVideoCall.participantNames[id] || 'Participant'
          }))}
          onClose={() => setActiveVideoCall(null)}
        />
      )}

      {/* MODAL: NEW ANNOUNCEMENT BROADCAST */}
      {isNewAnnouncementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17201D]">Diffuser une Annonce / Alerte</h3>
              <button
                type="button"
                onClick={() => setIsNewAnnouncementOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Titre de la communication *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Rappel : Réunion des parents d'élèves de NS1"
                  value={broadcastData.title}
                  onChange={e => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Canal de diffusion</label>
                  <select
                    value={broadcastData.channel}
                    onChange={e => setBroadcastData({ ...broadcastData, channel: e.target.value as ChannelType })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="in_app">Application EDUKA (In-App)</option>
                    <option value="sms">Passerelle SMS Nationale (Digicel/Natcom)</option>
                    <option value="whatsapp">WhatsApp Business API</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Public Cible</label>
                  <select
                    value={broadcastData.targetRole}
                    onChange={e => setBroadcastData({ ...broadcastData, targetRole: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="all">Toute la communauté scolaire</option>
                    <option value="parents">Parents / Responsables légaux uniquement</option>
                    <option value="teachers">Corps Enseignant uniquement</option>
                    <option value="students">Élèves uniquement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Message institutionnel *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Rédigez le contenu officiel de la communication..."
                  value={broadcastData.content}
                  onChange={e => setBroadcastData({ ...broadcastData, content: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={broadcastData.isUrgent}
                  onChange={e => setBroadcastData({ ...broadcastData, isUrgent: e.target.checked })}
                  className="rounded text-[#075B46]"
                />
                <label htmlFor="urgent" className="text-xs font-semibold text-[#C83B3B]">
                  Marquer comme Alerte Prioritaire / Urgente
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewAnnouncementOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] font-semibold"
                >
                  Diffuser le Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
