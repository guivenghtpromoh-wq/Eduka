/**
 * EDUKA - Offline-First Engine & Synchronisation Queue
 * Handles offline queues, network event detection, conflict prevention and background sync.
 */

import { SyncOperation } from '../types';
import { db } from './db';

export type NetworkStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'conflict';

class SyncEngine {
  private networkStatus: NetworkStatus = navigator.onLine ? 'online' : 'offline';
  private simulatedOffline: boolean = false;
  private listeners: Array<(status: NetworkStatus, queueCount: number) => void> = [];
  private syncTimer: any = null;

  constructor() {
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  isOnline(): boolean {
    if (this.simulatedOffline) return false;
    return navigator.onLine;
  }

  getStatus(): NetworkStatus {
    const queue = db.getSyncQueue();
    const hasConflict = queue.some(q => q.status === 'conflict');
    if (hasConflict) return 'conflict';
    if (!this.isOnline()) return 'offline';
    if (this.networkStatus === 'syncing') return 'syncing';
    const hasPending = queue.some(q => q.status === 'pending');
    if (hasPending) return 'syncing';
    return 'synced';
  }

  toggleSimulatedOffline(): boolean {
    this.simulatedOffline = !this.simulatedOffline;
    if (this.simulatedOffline) {
      this.networkStatus = 'offline';
      this.notify();
    } else {
      this.handleNetworkChange(navigator.onLine);
    }
    return this.simulatedOffline;
  }

  isSimulationActive(): boolean {
    return this.simulatedOffline;
  }

  private handleNetworkChange(online: boolean): void {
    if (this.simulatedOffline) return;

    if (online) {
      this.networkStatus = 'online';
      this.notify();
      this.triggerBackgroundSync();
    } else {
      this.networkStatus = 'offline';
      this.notify();
    }
  }

  enqueue(type: SyncOperation['type'], payload: any, userId: string): SyncOperation {
    const op = db.addSyncOperation({
      type,
      deviceId: 'device-terminal-main',
      userId,
      payload,
    });

    if (this.isOnline()) {
      this.triggerBackgroundSync();
    } else {
      this.notify();
    }
    return op;
  }

  triggerBackgroundSync(): void {
    if (!this.isOnline()) return;

    clearTimeout(this.syncTimer);
    this.networkStatus = 'syncing';
    this.notify();

    this.syncTimer = setTimeout(() => {
      const queue = db.getSyncQueue();
      const pending = queue.filter(q => q.status === 'pending');

      pending.forEach(item => {
        // Mark synced unless simulated conflict
        db.updateSyncOperation(item.id, 'synced');
      });

      this.networkStatus = 'synced';
      this.notify();
    }, 1200);
  }

  simulateConflict(opId: string): void {
    db.updateSyncOperation(opId, 'conflict', 'Une version concurrente a été modifiée sur le serveur central le même jour.');
    this.notify();
  }

  resolveConflict(opId: string, resolution: 'keep_local' | 'accept_server'): void {
    if (resolution === 'keep_local') {
      db.updateSyncOperation(opId, 'synced');
    } else {
      // Revert or accept server
      db.updateSyncOperation(opId, 'synced');
    }
    this.notify();
  }

  subscribe(listener: (status: NetworkStatus, queueCount: number) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const queue = db.getSyncQueue();
    const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'conflict').length;
    const status = this.getStatus();
    this.listeners.forEach(l => l(status, pendingCount));
  }
}

export const syncEngine = new SyncEngine();
