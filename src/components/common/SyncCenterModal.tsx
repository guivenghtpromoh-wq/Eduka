/**
 * EDUKA - Offline Sync Queue & Conflict Resolution Center
 * Transparent tracking of pending operations, conflict inspection, and manual/auto sync triggers.
 */

import React, { useState } from 'react';
import {
  RefreshCw,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCcw,
  Smartphone,
  Check
} from 'lucide-react';
import { db } from '../../services/db';
import { syncEngine, NetworkStatus } from '../../services/sync';
import { StatusBadge } from './UIStates';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkStatus: NetworkStatus;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({
  isOpen,
  onClose,
  networkStatus,
}) => {
  const [, setTick] = useState(0);

  if (!isOpen) return null;

  const queue = db.getSyncQueue();
  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const conflictCount = queue.filter(q => q.status === 'conflict').length;
  const isSimulated = syncEngine.isSimulationActive();

  const handleManualSync = () => {
    syncEngine.triggerBackgroundSync();
    setTick(t => t + 1);
  };

  const handleClearSynced = () => {
    db.clearSyncedOperations();
    setTick(t => t + 1);
  };

  const handleResolve = (opId: string, resolution: 'keep_local' | 'accept_server') => {
    syncEngine.resolveConflict(opId, resolution);
    setTick(t => t + 1);
  };

  const handleSimulateConflict = (opId: string) => {
    syncEngine.simulateConflict(opId);
    setTick(t => t + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#F5F7F6]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DDF3EA] text-[#075B46] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17201D]">
                Centre de Synchronisation Offline-First
              </h3>
              <p className="text-xs text-[#66736D]">
                Gestion des files d'attente locales et prévention des conflits de données
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Status Banner */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-3">
              {networkStatus === 'offline' ? (
                <WifiOff className="w-5 h-5 text-[#C83B3B]" />
              ) : networkStatus === 'conflict' ? (
                <AlertTriangle className="w-5 h-5 text-[#D9822B]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#075B46]" />
              )}
              <div>
                <div className="text-xs font-bold text-[#17201D]">
                  État du terminal :{' '}
                  <span className={networkStatus === 'offline' ? 'text-[#C83B3B]' : 'text-[#075B46]'}>
                    {networkStatus === 'offline' ? 'Hors ligne (Mode Déconnecté)' : 'Connecté au Réseau'}
                  </span>
                </div>
                <div className="text-[11px] text-[#66736D]">
                  {pendingCount} en attente • {conflictCount} conflit(s) détecté(s) •{' '}
                  {isSimulated ? 'Simulation coupure active' : 'Connexion physique'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={networkStatus === 'offline'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] disabled:opacity-50 rounded-lg shadow-2xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Synchroniser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Operations List */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
          {queue.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              La file de synchronisation est vide. Toutes les transactions sont à jour avec la base centrale.
            </div>
          ) : (
            queue.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border text-xs transition-colors ${
                  item.status === 'conflict'
                    ? 'border-amber-300 bg-amber-50/50'
                    : item.status === 'pending'
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-slate-500">{item.id}</span>
                      <StatusBadge status={item.status} />
                      <span className="text-[11px] font-bold text-[#17201D] capitalize">
                        {item.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#66736D] flex items-center gap-2">
                      <Smartphone className="w-3 h-3" />
                      <span>Terminal : {item.deviceId}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {item.status === 'conflict' && item.errorDetails && (
                      <div className="mt-2 p-2 rounded bg-amber-100/70 border border-amber-200 text-amber-900 text-[11px]">
                        <strong>Alerte d'intégrité :</strong> {item.errorDetails}
                      </div>
                    )}
                  </div>

                  {/* Actions for conflict */}
                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {item.status === 'conflict' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleResolve(item.id, 'keep_local')}
                          className="px-2 py-1 text-[10px] font-semibold bg-[#075B46] text-white rounded hover:bg-[#0B8064]"
                          title="Conserver la version locale de l'établissement"
                        >
                          Garder Local
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(item.id, 'accept_server')}
                          className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
                          title="Accepter la version du serveur central"
                        >
                          Accepter Serveur
                        </button>
                      </>
                    ) : item.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleSimulateConflict(item.id)}
                        className="px-2 py-1 text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 rounded"
                        title="Simuler un conflit d'édition concurrente"
                      >
                        Simuler Conflit
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-medium text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Validé
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-[#F5F7F6] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleClearSynced}
            className="text-slate-500 hover:text-slate-800 underline"
          >
            Purger les éléments synchronisés
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#17201D] text-white rounded-lg hover:bg-black font-medium"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
