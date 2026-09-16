/**
 * EDUKA - Official Authentication & Portal Access View
 * Faithfully matches Panel 1 of the institutional reference specification:
 * - Brand crest with "Une seule plateforme pour toute votre école"
 * - Official feature catalogue (Élèves, Notes, Présences, Finances, etc.)
 * - Academic campus photo card with "Une meilleure gestion pour une éducation de qualité"
 * - Signature gold script "L'éducation au service de demain"
 * - Segmented Personnel / Élève / Parent login cards with immediate role switching
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  FileText,
  Clock,
  CreditCard,
  MessageSquare,
  Calendar,
  FolderClosed,
  BarChart3,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { auth, DEMO_USERS } from '../../services/auth';

interface AuthLoginViewProps {
  onLoginSuccess: (user: User) => void;
}

type UserCategory = 'personnel' | 'eleve' | 'parent';

export const AuthLoginView: React.FC<AuthLoginViewProps> = ({ onLoginSuccess }) => {
  const [category, setCategory] = useState<UserCategory>('personnel');
  const [emailOrId, setEmailOrId] = useState('admin@polycarpe.eduka.ht');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState<'eleve' | 'parent' | null>(null);

  // Handle segmented role switch
  const handleCategoryChange = (newCat: UserCategory) => {
    setCategory(newCat);
    if (newCat === 'personnel') {
      setSelectedRole('admin');
      setEmailOrId(DEMO_USERS.admin.email);
    } else if (newCat === 'eleve') {
      setSelectedRole('eleve');
      setEmailOrId(DEMO_USERS.eleve.matricule || DEMO_USERS.eleve.email);
    } else {
      setSelectedRole('parent');
      setEmailOrId(DEMO_USERS.parent.email);
    }
  };

  // Quick select specific demo account
  const handleSelectDemoUser = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    if (!demoUser) return;
    
    setSelectedRole(role);
    if (role === 'eleve') {
      setCategory('eleve');
      setEmailOrId(demoUser.matricule || demoUser.email);
    } else if (role === 'parent') {
      setCategory('parent');
      setEmailOrId(demoUser.email);
    } else {
      setCategory('personnel');
      setEmailOrId(demoUser.email);
    }
    setPassword('••••••••••••');
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate verified institutional token check
    setTimeout(() => {
      auth.switchRole(selectedRole);
      const user = auth.getCurrentUser();
      setIsLoading(false);
      onLoginSuccess(user);
    }, 450);
  };

  const featureList = [
    { label: 'Gestion des élèves', icon: GraduationCap },
    { label: 'Notes & Bulletins', icon: FileText },
    { label: 'Présences', icon: Clock },
    { label: 'Finances', icon: CreditCard },
    { label: 'Communication', icon: MessageSquare },
    { label: 'Emplois du temps', icon: Calendar },
    { label: 'Documents', icon: FolderClosed },
    { label: 'Rapports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#075B46] text-white flex flex-col justify-between font-sans selection:bg-[#E7B93E] selection:text-[#075B46]">
      {/* Main Dual-Pane Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        
        {/* LEFT COLUMN: Brand Identity, Features & Academic Campus (Exact Match to Reference Image) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between max-w-xl">
          {/* Header Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E7B93E] text-[#075B46] flex items-center justify-center shadow-lg font-display">
                <GraduationCap className="w-7 h-7" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                  EDUKA
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                  Une seule plateforme pour toute votre école
                </p>
              </div>
            </div>

            {/* Feature List (Exact pills with circular yellow icon tags from reference image) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-8">
              {featureList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-sm font-medium text-emerald-50 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#E7B93E] text-[#075B46] flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Academic School Campus Card with Signature Script */}
          <div className="mt-8 pt-6 border-t border-emerald-700/60">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 group">
              {/* Campus architectural photo banner */}
              <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-emerald-900 via-[#075B46] to-emerald-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
                  alt="Campus Scolaire"
                  className="w-full h-full object-cover object-center opacity-45 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#043327] via-[#075B46]/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
                  <Building2 className="w-5 h-5 text-[#E7B93E] shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold tracking-wide text-white drop-shadow-xs">
                    Une meilleure gestion pour une éducation de qualité
                  </p>
                </div>
              </div>
            </div>

            {/* Slogan in authentic gold script matching the reference image */}
            <div className="mt-4 flex items-center justify-between">
              <span className="font-script text-2xl sm:text-3xl text-[#E7B93E] tracking-wide drop-shadow-sm">
                L&apos;éducation au service de demain
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-200/80 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E7B93E]" />
                Système Officiel Agréé
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Official EDUKA Login Card (Exact Match to Panel 1) */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 text-[#17201D]">
            
            {/* Card Brand Emblem */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#075B46] text-[#E7B93E] flex items-center justify-center shadow-md">
                <GraduationCap className="w-8 h-8" strokeWidth={2.4} />
              </div>
              <h2 className="mt-3 text-2xl font-bold font-display tracking-tight text-[#075B46]">
                EDUKA
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Connectez-vous à votre compte
              </p>
            </div>

            {/* Segmented Category Control [Personnel | Élève | Parent] */}
            <div className="mt-6 p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleCategoryChange('personnel')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  category === 'personnel'
                    ? 'bg-white text-[#075B46] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Personnel
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('eleve')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  category === 'eleve'
                    ? 'bg-white text-[#075B46] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Élève
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('parent')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  category === 'parent'
                    ? 'bg-white text-[#075B46] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parent
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Email or Identifiant */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  {category === 'eleve' ? 'Matricule élève ou email' : 'Email ou identifiant'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    placeholder={category === 'eleve' ? 'Ex: EDK-2024-001' : 'nom@ecole.eduka.ht'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#17201D] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] focus:border-[#075B46] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#17201D] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#075B46] focus:border-[#075B46] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#075B46] focus:ring-[#075B46] border-slate-300"
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-medium text-[#075B46] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#075B46] hover:bg-[#054837] active:bg-[#04372A] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Links: Activer compte élève / parent */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setShowActivationModal('eleve')}
                className="text-[#075B46] font-medium hover:underline"
              >
                Activer compte élève
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setShowActivationModal('parent')}
                className="text-[#075B46] font-medium hover:underline"
              >
                Activer compte parent
              </button>
            </div>

            {/* Instant Demo Accounts Switcher (For Evaluation & Inspection) */}
            <div className="mt-5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
              <div className="flex items-center justify-between text-[#075B46] font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E7B93E]" />
                  Comptes de démonstration (1-clic)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Cliquez pour tester</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { role: 'admin' as UserRole, label: 'Admin', icon: '👑' },
                  { role: 'direction' as UserRole, label: 'Direction', icon: '🏫' },
                  { role: 'enseignant' as UserRole, label: 'Professeur', icon: '👨‍🏫' },
                  { role: 'comptable' as UserRole, label: 'Comptable', icon: '💼' },
                  { role: 'eleve' as UserRole, label: 'Élève', icon: '🎒' },
                  { role: 'parent' as UserRole, label: 'Parent', icon: '👨‍👩‍👧' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectDemoUser(item.role)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selectedRole === item.role
                        ? 'bg-[#075B46] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-emerald-100/80 border border-slate-200/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Specification Bar */}
      <footer className="w-full border-t border-emerald-800/60 py-3.5 px-4 text-center text-xs text-emerald-100/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EDUKA — Une plateforme complète pour une gestion scolaire efficace</span>
          <span className="text-emerald-200/60 text-[11px]">
            Haïti • Conforme aux standards MENFP • Mode Hors-Ligne Actif
          </span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-[#17201D]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#075B46] flex items-center justify-center mb-3">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#17201D]">Réinitialisation de mot de passe</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Pour des raisons de sécurité institutionnelle, la réinitialisation des accès s&apos;effectue auprès du secrétariat ou de l&apos;administrateur de votre établissement avec votre pièce d&apos;identité ou numéro de matricule.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              <p className="font-semibold text-[#075B46]">Comptes de test disponibles :</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tous les profils de démonstration sont déverrouillés sans mot de passe complexe.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full py-2.5 bg-[#075B46] text-white rounded-xl text-xs font-semibold hover:bg-[#054837]"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-[#17201D]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-[#DDF3EA] text-[#075B46] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#17201D]">
              {showActivationModal === 'eleve' ? 'Activation Compte Élève' : 'Activation Compte Parent'}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Saisissez le code d&apos;inscription officiel à 8 chiffres remis lors de votre inscription ou sur votre reçu de scolarité.
            </p>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Ex: EDK-8842-99"
                defaultValue={showActivationModal === 'eleve' ? 'EDK-2024-001' : 'PAR-2024-042'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs uppercase tracking-wider font-mono focus:outline-hidden focus:ring-2 focus:ring-[#075B46]"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectDemoUser(showActivationModal === 'eleve' ? 'eleve' : 'parent');
                  setShowActivationModal(null);
                }}
                className="flex-1 py-2.5 bg-[#075B46] text-white rounded-xl text-xs font-semibold hover:bg-[#054837]"
              >
                Valider &amp; Ouvrir Session
              </button>
              <button
                type="button"
                onClick={() => setShowActivationModal(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
