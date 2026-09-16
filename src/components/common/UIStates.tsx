/**
 * EDUKA - Standard Institutional UI States & Components
 * Strictly ZERO emojis. Clean typography, high-contrast, accessible icons.
 */

import React from 'react';
import {
  AlertCircle,
  FolderOpen,
  Lock,
  Loader2,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { NetworkStatus } from '../../services/sync';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon: Icon = FolderOpen
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white border border-slate-200 rounded-xl max-w-xl mx-auto shadow-xs my-6">
      <div className="w-14 h-14 rounded-full bg-[#DDF3EA] flex items-center justify-center text-[#075B46] mb-4">
        <Icon className="w-7 h-7" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-semibold text-[#17201D] mb-2">{title}</h3>
      <p className="text-sm text-[#66736D] leading-relaxed mb-6 max-w-md">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#075B46]"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#17201D] bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Chargement des données institutionnelles...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="w-8 h-8 text-[#075B46] animate-spin mb-3" />
      <p className="text-sm text-[#66736D] font-medium">{message}</p>
    </div>
  );
};

export const PermissionDeniedState: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'Accès restreint par politique de sécurité',
  description = 'Votre profil ne dispose pas des privilèges nécessaires pour consulter ou modifier cette ressource. Veuillez contacter l\'administrateur système ou la direction.'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-red-200 rounded-xl max-w-lg mx-auto my-8 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#C83B3B] mb-4">
        <Lock className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#17201D] mb-2">{title}</h3>
      <p className="text-sm text-[#66736D] leading-relaxed">{description}</p>
    </div>
  );
};

export const StatusBadge: React.FC<{
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label?: string;
}> = ({ status, variant, label }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'success' || status === 'active' || status === 'paid' || status === 'present' || status === 'validee' || status === 'synced') {
    badgeStyle = 'bg-[#DDF3EA] text-[#075B46] border-[#BCE6D6]';
  } else if (variant === 'warning' || status === 'late' || status === 'partial' || status === 'en_attente' || status === 'draft' || status === 'conflict') {
    badgeStyle = 'bg-amber-50 text-[#D9822B] border-amber-200';
  } else if (variant === 'error' || status === 'absent' || status === 'unpaid' || status === 'refusee' || status === 'locked' || status === 'offline') {
    badgeStyle = 'bg-red-50 text-[#C83B3B] border-red-200';
  } else if (variant === 'info' || status === 'excused' || status === 'syncing') {
    badgeStyle = 'bg-emerald-50 text-[#0B8064] border-emerald-200';
  }

  const displayText = label || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} tracking-wide whitespace-nowrap`}>
      {displayText}
    </span>
  );
};

export const NetworkSyncIndicator: React.FC<{
  status: NetworkStatus;
  queueCount: number;
  onOpenSyncCenter: () => void;
}> = ({ status, queueCount, onOpenSyncCenter }) => {
  let bg = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#075B46]" />;
  let label = 'En ligne';

  if (status === 'offline') {
    bg = 'bg-red-50 text-[#C83B3B] border border-red-200 hover:bg-red-100';
    icon = <WifiOff className="w-3.5 h-3.5" />;
    label = queueCount > 0 ? `Hors ligne (${queueCount} en attente)` : 'Hors ligne';
  } else if (status === 'syncing') {
    bg = 'bg-emerald-50 text-[#075B46] border border-emerald-200';
    icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    label = 'Synchronisation...';
  } else if (status === 'conflict') {
    bg = 'bg-amber-50 text-[#D9822B] border border-amber-200 hover:bg-amber-100';
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
    label = 'Conflit détecté';
  } else if (status === 'synced') {
    bg = 'bg-[#DDF3EA] text-[#075B46] border border-[#BCE6D6]';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#075B46]" />;
    label = 'Synchronisé';
  }

  return (
    <button
      type="button"
      onClick={onOpenSyncCenter}
      title="Ouvrir le centre de synchronisation offline"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${bg}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
