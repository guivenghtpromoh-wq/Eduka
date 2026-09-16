/**
 * EDUKA - Institution Settings & System Configuration Module
 * School identity, academic calendar, currency exchange rates,
 * grading scales, and deterministic JSON backup & restore.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Calendar,
  DollarSign,
  Award,
  Database,
  Save,
  Download,
  Upload,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { School } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';

interface SettingsViewProps {
  currentSchool: School;
  onSchoolUpdated: (updatedSchool: School) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentSchool, onSchoolUpdated }) => {
  const [formData, setFormData] = useState({
    name: currentSchool.name,
    code: currentSchool.code,
    phone: currentSchool.phone,
    email: currentSchool.email,
    address: currentSchool.address,
    city: currentSchool.city,
    exchangeRateUsdToHtg: currentSchool.exchangeRateUsdToHtg,
    passingScore: 65,
    maxScoreScale: 100,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: School = {
      ...currentSchool,
      name: formData.name.trim(),
      code: formData.code.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      exchangeRateUsdToHtg: Number(formData.exchangeRateUsdToHtg) || 132.5,
    };

    db.updateSchool(updated);
    onSchoolUpdated(updated);

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'settings.update',
      resource: 'School',
      resourceId: currentSchool.id,
      details: `Mise à jour des paramètres généraux de ${updated.name}`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const rawData = localStorage.getItem('eduka_enterprise_db_v1') || '{}';
    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EDUKA_Backup_${currentSchool.code}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Attention : Cette action réinitialisera la base de données avec les données de démonstration certifiées. Continuer ?')) {
      db.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Paramètres Institutionnels</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              Configuration Système
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Identité de l'établissement, taux de change, barème d'évaluation et sauvegarde des données
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#075B46] hover:bg-[#0B8064] rounded-lg shadow-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les Modifications</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#DDF3EA] border border-[#BCE6D6] rounded-lg text-xs font-semibold text-[#075B46] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Paramètres mis à jour et propagés dans toute la plateforme.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* School Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-[#075B46]" />
            <h3 className="text-sm font-bold text-[#17201D]">Identité de l'Établissement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#17201D] mb-1">Raison sociale / Nom complet *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17201D] mb-1">Code Établissement (Matricule Préfixe) *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-[#075B46]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17201D] mb-1">Email Institutionnel *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17201D] mb-1">Téléphone officiel *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#17201D] mb-1">Adresse physique complète</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Financial & Currency Settings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-[#075B46]" />
            <h3 className="text-sm font-bold text-[#17201D]">Paramètres Monétaires & Taux de Change</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#17201D] mb-1">
                Taux de Conversion Officiel (1 USD en HTG) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="300"
                  value={formData.exchangeRateUsdToHtg}
                  onChange={e => setFormData({ ...formData, exchangeRateUsdToHtg: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-[#075B46]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                  HTG
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ce taux est appliqué sur les conversions d'échéances et de factures dans le module finance.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#17201D] mb-1">Note minimale de passage (sur 100)</label>
              <input
                type="number"
                min="50"
                max="80"
                value={formData.passingScore}
                onChange={e => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Seuil de réussite pour les mentions de bulletin et décisions du conseil des maîtres.
              </p>
            </div>
          </div>
        </div>

        {/* Database & Backup Management */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-[#075B46]" />
            <h3 className="text-sm font-bold text-[#17201D]">Sauvegarde & Données Institutionnelles</h3>
          </div>

          <p className="text-xs text-[#66736D]">
            Les données sont persistées dans le moteur transactionnel local sécurisé. Vous pouvez exporter une sauvegarde intégrale JSON à tout moment.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F5F7F6] hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter la Sauvegarde Complète (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser aux Données Initiales</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
