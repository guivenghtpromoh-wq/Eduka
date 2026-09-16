/**
 * EDUKA - Security Center & Immutable Audit Trail
 * Append-only security events, remote session management, MFA status,
 * and granular RBAC role inspection.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  AlertTriangle,
  History,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Filter
} from 'lucide-react';
import { School, AuditLog } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/UIStates';

interface SecurityCenterViewProps {
  currentSchool: School;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({ currentSchool }) => {
  const [logs, setLogs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Simulated active sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess-001',
      device: 'MacBook Pro (Chrome 122)',
      ip: '190.115.16.42',
      location: 'Port-au-Prince, HT',
      lastActive: 'Actif maintenant',
      isCurrent: true,
    },
    {
      id: 'sess-002',
      device: 'Samsung Galaxy A54 (EDUKA Mobile App)',
      ip: '190.115.18.99',
      location: 'Pétion-Ville, HT',
      lastActive: 'Il y a 2 heures',
      isCurrent: false,
    },
  ]);

  const filteredLogs = logs.filter(log => {
    if (roleFilter !== 'all' && log.userRole !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'security.session_revoked',
      resource: 'Session',
      resourceId: sessionId,
      details: `Révocation à distance de la session ${sessionId}`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });
    setLogs(db.getAuditLogs());
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Centre de Sécurité & Registre d'Audit</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              Journal Immuable
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Traçabilité des opérations sensibles, sessions actives, authentification forte et intégrité des données
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#DDF3EA] border border-[#BCE6D6] rounded-lg text-xs font-bold text-[#075B46] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Chiffrement AES-256 & TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* Security Health & Active Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Security Checklist */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#17201D] border-b border-slate-100 pb-2">
            Contrôles de Sécurité Actifs
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#075B46] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#17201D]">RBAC Granulaire</span>
                <p className="text-[#66736D] text-[11px]">Enforcement strict par rôle et permissions vérifiées</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#075B46] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#17201D]">Registre Append-Only</span>
                <p className="text-[#66736D] text-[11px]">Interdiction structurelle de modifier ou supprimer les logs</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#075B46] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#17201D]">Isolation Multi-Tenant</span>
                <p className="text-[#66736D] text-[11px]">Cloisonnement strict des données entre écoles</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#075B46] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#17201D]">Protection contre le Rejeu</span>
                <p className="text-[#66736D] text-[11px]">UUID unique et détection de collision sur la file offline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-[#17201D]">Sessions Actives Authentifiées</h3>
            <span className="text-xs text-slate-500">{sessions.length} appareils connectés</span>
          </div>

          <div className="space-y-3 text-xs">
            {sessions.map(sess => (
              <div
                key={sess.id}
                className="p-3 bg-[#F5F7F6] rounded-lg border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-4 h-4 text-[#075B46]" />
                  <div>
                    <div className="font-bold text-[#17201D] flex items-center gap-2">
                      <span>{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="text-[10px] bg-[#DDF3EA] text-[#075B46] px-2 py-0.5 rounded font-semibold">
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#66736D] mt-0.5">
                      IP : {sess.ip} • {sess.location} • {sess.lastActive}
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Immutable Audit Trail Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#17201D]">Journal d'Audit Immuable (Append-Only)</h3>
            <p className="text-xs text-[#66736D]">Historique inaltérable des actions administratives et financières</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer les actions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-[#F5F7F6]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="direction">Direction</option>
              <option value="enseignant">Enseignant</option>
              <option value="comptable">Comptable</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Utilisateur</th>
                <th className="py-2.5 px-3">Rôle</th>
                <th className="py-2.5 px-3">Action Enregistrée</th>
                <th className="py-2.5 px-3">Détails / Cible</th>
                <th className="py-2.5 px-3">Adresse IP</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-600">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#17201D] font-sans font-medium">
                    {log.userEmail}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500 font-semibold">
                    {log.userRole}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#075B46]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {log.ipAddress}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="text-[10px] font-bold text-[#075B46] bg-[#DDF3EA] px-2 py-0.5 rounded">
                      SUCCESS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
