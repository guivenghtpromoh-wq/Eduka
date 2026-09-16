/**
 * EDUKA - Message Requests Panel
 * Displays pending direct communication requests sent to the user.
 * Allows approving (which automatically unlocks direct messaging) or declining.
 * STRICTLY ZERO EMOJIS.
 */

import React from 'react';
import { UserCheck, Check, X, Shield, Clock, MessageSquare } from 'lucide-react';
import { MessageRequest, ChatConversation } from '../../../types';
import { db } from '../../../services/db';

interface MessageRequestsPanelProps {
  requests: MessageRequest[];
  onRequestHandled: (updatedReq: MessageRequest, openedConv?: ChatConversation) => void;
}

export const MessageRequestsPanel: React.FC<MessageRequestsPanelProps> = ({
  requests,
  onRequestHandled
}) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleAccept = (req: MessageRequest) => {
    const updated = db.updateMessageRequestStatus(req.id, 'accepted');
    if (updated) {
      // Find the newly created or existing conversation
      const allConvs = db.getConversations();
      const conv = allConvs.find(
        c => c.type === 'direct' && c.participantIds.includes(req.fromUserId) && c.participantIds.includes(req.toUserId)
      );
      onRequestHandled(updated, conv);
    }
  };

  const handleDecline = (req: MessageRequest) => {
    const updated = db.updateMessageRequestStatus(req.id, 'rejected');
    if (updated) {
      onRequestHandled(updated);
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#075B46] flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Bwat Demann lan Vid</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Ou pa gen okenn demann mesaj an attant pou kounye a. Lè yon kamarad voye yon demann, w ap ka valide l isit la.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Demann Mesaj an Attant ({pendingRequests.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-500">
          Valide pou ouvri diskisyon an dirèk
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#075B46] font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200">
                {req.fromUserName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">{req.fromUserName}</h5>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {req.className}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 max-w-xl">
                  "{req.initialMessage}"
                </p>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Shield className="w-3 h-3" />
                    Kamarad nan menm klas
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleDecline(req)}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Refize</span>
              </button>

              <button
                type="button"
                onClick={() => handleAccept(req)}
                className="px-3.5 py-2 bg-[#075B46] hover:bg-[#064e3b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aksepte & Kòmanse Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
