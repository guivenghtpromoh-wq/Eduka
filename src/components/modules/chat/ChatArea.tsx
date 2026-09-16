/**
 * EDUKA - Interactive Chat Area
 * Real-time conversation view supporting text, audio voice notes,
 * image/photo attachments with lightbox, rich academic note cards,
 * and one-click Video Call launching.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Send,
  Mic,
  Image as ImageIcon,
  BookOpen,
  X,
  FileText,
  Clock,
  CheckCheck,
  ChevronLeft,
  Users,
  Shield,
  Download,
  Eye
} from 'lucide-react';
import { ChatConversation, ChatMessage, User, ChatNoteData } from '../../../types';
import { db } from '../../../services/db';
import { AudioVoicePlayer } from './AudioVoicePlayer';
import { AudioVoiceRecorder } from './AudioVoiceRecorder';
import { ShareNoteModal } from './ShareNoteModal';

interface ChatAreaProps {
  conversation: ChatConversation;
  currentUser: User;
  onBack?: () => void;
  onStartVideoCall: (conv: ChatConversation) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  currentUser,
  onBack,
  onStartVideoCall
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activePhotoLightbox, setActivePhotoLightbox] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load messages whenever conversation changes
  useEffect(() => {
    const msgs = db.getMessages(conversation.id);
    setMessages(msgs);
  }, [conversation.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecordingVoice]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      schoolId: conversation.schoolId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: currentUser.role,
      type: 'text',
      content: inputText.trim(),
      sentAt: new Date().toISOString(),
      readBy: [currentUser.id]
    };

    db.addMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleSendVoice = (mediaUrl: string, durationSeconds: number) => {
    setIsRecordingVoice(false);

    const newMsg: ChatMessage = {
      id: `msg-voice-${Date.now()}`,
      conversationId: conversation.id,
      schoolId: conversation.schoolId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: currentUser.role,
      type: 'voice',
      content: 'Message vocal',
      duration: durationSeconds,
      mediaUrl: mediaUrl || undefined,
      sentAt: new Date().toISOString(),
      readBy: [currentUser.id]
    };

    db.addMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendNote = (note: ChatNoteData) => {
    const newMsg: ChatMessage = {
      id: `msg-note-${Date.now()}`,
      conversationId: conversation.id,
      schoolId: conversation.schoolId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: currentUser.role,
      type: 'note',
      content: note.title,
      noteData: note,
      sentAt: new Date().toISOString(),
      readBy: [currentUser.id]
    };

    db.addMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;

      const newMsg: ChatMessage = {
        id: `msg-img-${Date.now()}`,
        conversationId: conversation.id,
        schoolId: conversation.schoolId,
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: currentUser.role,
        type: 'image',
        content: file.name || 'Photo partagée',
        mediaUrl: base64Url,
        sentAt: new Date().toISOString(),
        readBy: [currentUser.id]
      };

      db.addMessage(newMsg);
      setMessages(prev => [...prev, newMsg]);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDateLabel = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Hidden file input for photos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
            style={{ backgroundColor: conversation.avatarColor || '#075B46' }}
          >
            {conversation.isGroup ? (
              <Users className="w-5 h-5" />
            ) : (
              conversation.title?.split(' ').map(n => n[0]).slice(0, 2).join('')
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
              {conversation.title}
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              {conversation.className && (
                <span className="font-medium text-emerald-700">{conversation.className}</span>
              )}
              {conversation.isGroup && (
                <>
                  <span>•</span>
                  <span>{conversation.participantIds.length} manm</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Action: Launch Video Call */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onStartVideoCall(conversation)}
            className="px-3.5 py-2 bg-[#075B46] hover:bg-[#064e3b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Lanse yon apèl videyo an dirèk"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Apèl Videyo</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Safe Encryption Notice */}
        <div className="flex justify-center my-2">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-full px-3.5 py-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
            <Shield className="w-3.5 h-3.5 text-[#075B46]" />
            <span>Kominikasyon pedagojik sekirize nan kad etablisman an</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-400">
            <p className="text-xs">Okenn mesaj poko voye nan diskisyon sa a.</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Kòmanse pale, voye yon vokal, yon foto oswa yon nòt etid anba a.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.id;
            const showDateHeader =
              index === 0 ||
              new Date(messages[index - 1].sentAt).toDateString() !==
                new Date(msg.sentAt).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="flex justify-center my-3">
                    <span className="px-3 py-0.5 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                      {formatDateLabel(msg.sentAt)}
                    </span>
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name in groups */}
                  {!isMe && conversation.isGroup && (
                    <span className="text-[10px] font-semibold text-slate-500 mb-1 ml-2">
                      {msg.senderName}
                    </span>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 shadow-2xs transition-all ${
                      isMe
                        ? 'bg-[#075B46] text-white rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    {/* TYPE: TEXT */}
                    {msg.type === 'text' && (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}

                    {/* TYPE: VOICE NOTE */}
                    {msg.type === 'voice' && (
                      <AudioVoicePlayer
                        mediaUrl={msg.mediaUrl}
                        durationSeconds={msg.duration || 12}
                        isSender={isMe}
                      />
                    )}

                    {/* TYPE: IMAGE / PHOTO */}
                    {msg.type === 'image' && (
                      <div className="space-y-1.5">
                        <div
                          className="rounded-xl overflow-hidden cursor-pointer relative group bg-black/10 border border-black/10"
                          onClick={() => msg.mediaUrl && setActivePhotoLightbox(msg.mediaUrl)}
                        >
                          {msg.mediaUrl ? (
                            <img
                              src={msg.mediaUrl}
                              alt="Photo partagée"
                              className="max-h-60 w-full object-cover group-hover:opacity-95 transition-opacity"
                            />
                          ) : (
                            <div className="h-40 flex items-center justify-center text-xs bg-slate-100 text-slate-500">
                              Foto pa disponib
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Gade Foto</span>
                          </div>
                        </div>
                        {msg.content && msg.content !== 'Photo partagée' && (
                          <p className="text-xs pt-1">{msg.content}</p>
                        )}
                      </div>
                    )}

                    {/* TYPE: NOTE / HOMEWORK */}
                    {msg.type === 'note' && msg.noteData && (
                      <div className="space-y-2 min-w-[240px]">
                        <div
                          className={`flex items-center justify-between pb-1.5 border-b ${
                            isMe ? 'border-white/20 text-emerald-100' : 'border-slate-200 text-[#075B46]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{msg.noteData.subject || 'Nòt Kou'}</span>
                          </div>
                          <span className="text-[10px] uppercase font-semibold">EDUKA NOTE</span>
                        </div>

                        <h4 className="text-xs font-bold leading-tight">{msg.noteData.title}</h4>

                        <div
                          className={`p-2.5 rounded-xl text-xs whitespace-pre-wrap font-sans max-h-44 overflow-y-auto ${
                            isMe ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-800 border border-slate-100'
                          }`}
                        >
                          {msg.noteData.text}
                        </div>
                      </div>
                    )}

                    {/* Timestamp & status */}
                    <div
                      className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                        isMe ? 'text-emerald-100/80' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatTime(msg.sentAt)}</span>
                      {isMe && <CheckCheck className="w-3 h-3 ml-0.5" />}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        {isRecordingVoice ? (
          <AudioVoiceRecorder
            onSendVoice={handleSendVoice}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            {/* Action buttons: Photo, Note, Voice */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-[#075B46] hover:bg-slate-100 rounded-xl transition-colors"
                title="Pataje yon foto / devoir"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsNoteModalOpen(true)}
                className="p-2 text-slate-500 hover:text-[#075B46] hover:bg-slate-100 rounded-xl transition-colors"
                title="Voye yon nòt etid oswa rezime"
              >
                <BookOpen className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2 text-slate-500 hover:text-[#075B46] hover:bg-slate-100 rounded-xl transition-colors"
                title="Anrejistre yon nòt vokal"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              placeholder="Ekri yon mesaj..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] focus:border-transparent"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-[#075B46] hover:bg-[#064e3b] disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs shrink-0"
              title="Voye mesaj"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Share Note Modal */}
      {isNoteModalOpen && (
        <ShareNoteModal
          onShare={handleSendNote}
          onClose={() => setIsNoteModalOpen(false)}
        />
      )}

      {/* Photo Lightbox */}
      {activePhotoLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhotoLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setActivePhotoLightbox(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activePhotoLightbox}
            alt="Plein écran"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
};
