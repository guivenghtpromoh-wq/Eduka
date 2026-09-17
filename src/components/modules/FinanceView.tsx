/**
 * EDUKA - Multi-Currency Finance & Fee Management Module
 * Supports dual HTG/USD pricing, installment plans, receipts (REC-YYYY-XXXXX),
 * partial payments, and official financial auditing.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  Printer,
  Download,
  Plus,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Calendar
} from 'lucide-react';
import { School, Invoice, Payment, Currency, PaymentMethod, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { formatCurrency, calculateFinanceSummary, convertCurrency } from '../../services/finance';
import { StatusBadge } from '../common/UIStates';
import { ParentFinanceView } from './finance/ParentFinanceView';

interface FinanceViewProps {
  currentSchool: School;
  initialInvoiceId?: string;
  currentUser?: User;
  onNavigate?: (tab: any) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  currentSchool,
  initialInvoiceId,
  currentUser,
  onNavigate,
}) => {
  // Role: Parent View - strictly isolated to their own children
  if (currentUser?.role === 'parent') {
    return <ParentFinanceView currentSchool={currentSchool} currentUser={currentUser} onNavigate={onNavigate} />;
  }

  // Role: Student View - notice that finance is managed by parents
  if (currentUser?.role === 'eleve') {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs text-center max-w-lg mx-auto space-y-4">
        <CreditCard className="w-12 h-12 text-[#075B46] mx-auto" />
        <h2 className="text-lg font-bold text-[#17201D]">Gestion Financière & Écolages</h2>
        <p className="text-xs text-[#66736D] leading-relaxed">
          Le suivi des frais de scolarité, factures et paiements est réservé aux parents et responsables légaux d'élèves. Votre statut scolaire est actuellement : <strong className="text-emerald-700 font-semibold">À Jour</strong>.
        </p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="px-4 py-2 bg-[#075B46] text-white text-xs font-semibold rounded-lg hover:bg-[#0B8064] transition-colors"
        >
          Retour à mon tableau de bord
        </button>
      </div>
    );
  }

  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices(currentSchool.id));
  const [payments, setPayments] = useState<Payment[]>(() => db.getPayments(currentSchool.id));
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(() => {
    if (initialInvoiceId) {
      return db.getInvoices(currentSchool.id).find(i => i.id === initialInvoiceId) || null;
    }
    return null;
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 15000,
    currency: 'HTG' as Currency,
    method: 'cash' as PaymentMethod,
    reference: '',
    note: '',
  });

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const canCreatePayment = auth.hasPermission('finance.create');

  const summary = useMemo(() => {
    return calculateFinanceSummary(currentSchool.id, currentSchool.exchangeRateUsdToHtg);
  }, [currentSchool.id, currentSchool.exchangeRateUsdToHtg, payments]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.studentName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, filterStatus, searchQuery]);

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balanceRemaining,
      currency: invoice.currency,
      method: 'cash',
      reference: '',
      note: `Versement écolage - ${invoice.studentName}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const paymentAmount = Number(paymentForm.amount);
    if (paymentAmount <= 0) {
      alert('Veuillez spécifier un montant supérieur à zéro.');
      return;
    }

    const year = new Date().getFullYear();
    const receiptNum = `REC-${year}-${String(payments.length + 101).padStart(5, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      schoolId: currentSchool.id,
      invoiceId: selectedInvoice.id,
      receiptNumber: receiptNum,
      studentId: selectedInvoice.studentId,
      studentName: selectedInvoice.studentName,
      amount: paymentAmount,
      currency: paymentForm.currency,
      paymentMethod: paymentForm.method,
      referenceNumber: paymentForm.reference || `REF-${Date.now().toString().slice(-6)}`,
      paidAt: new Date().toISOString(),
      receivedByUserId: auth.getCurrentUser().id,
      notes: paymentForm.note || undefined,
    };

    db.addPayment(newPayment);

    // Update invoice paid & balance
    const updatedPaid = selectedInvoice.amountPaid + paymentAmount;
    const updatedBalance = Math.max(0, selectedInvoice.totalAmount - updatedPaid);
    const updatedStatus = updatedBalance === 0 ? 'paid' : 'partial';

    db.updateInvoice({
      ...selectedInvoice,
      amountPaid: updatedPaid,
      balanceRemaining: updatedBalance,
      status: updatedStatus,
    });

    db.addAuditLog({
      userId: auth.getCurrentUser().id,
      userEmail: auth.getCurrentUser().email,
      userRole: auth.getCurrentUser().role,
      schoolId: currentSchool.id,
      action: 'finance.payment_record',
      resource: 'Payment',
      resourceId: newPayment.id,
      details: `Paiement enregistré de ${paymentAmount} ${paymentForm.currency} pour ${selectedInvoice.studentName} (Reçu : ${receiptNum})`,
      ipAddress: '190.115.16.42',
      status: 'success'
    });

    setInvoices(db.getInvoices(currentSchool.id));
    setPayments(db.getPayments(currentSchool.id));
    setIsPaymentModalOpen(false);

    // Immediately show printable receipt
    setSelectedReceipt(newPayment);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17201D]">Gestion Financière & Écolages</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#DDF3EA] text-[#075B46] rounded-full">
              Multi-Devise HTG / USD
            </span>
          </div>
          <p className="text-xs text-[#66736D] mt-1">
            Facturation académique, encaissements certifiés, reçus officiels REC-2024-XXXXX
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F5F7F6] rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500">Taux de change fixé : </span>
            <strong className="text-[#075B46]">1 USD = {currentSchool.exchangeRateUsdToHtg} HTG</strong>
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-[#66736D] uppercase tracking-wider">Total Facturé</span>
          <div className="text-2xl font-bold text-[#17201D] mt-1">
            {formatCurrency(summary.totalInvoicedHtg, 'HTG')}
          </div>
          <span className="text-[11px] text-slate-500">
            Équivalent : {formatCurrency(summary.totalInvoicedHtg / currentSchool.exchangeRateUsdToHtg, 'USD')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-[#075B46] uppercase tracking-wider">Total Encaissé</span>
          <div className="text-2xl font-bold text-[#075B46] mt-1">
            {formatCurrency(summary.totalPaidHtg, 'HTG')}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            Taux de recouvrement : {summary.collectionRatePercentage}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-[#D9822B] uppercase tracking-wider">Créances & Impayés</span>
          <div className="text-2xl font-bold text-[#D9822B] mt-1">
            {formatCurrency(summary.totalBalanceHtg, 'HTG')}
          </div>
          <span className="text-[11px] text-amber-700">À relancer auprès des tuteurs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Reçus Émis</span>
          <div className="text-2xl font-bold text-[#17201D] mt-1">{payments.length}</div>
          <span className="text-[11px] text-slate-500">Imprimables avec cachet</span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Tabs */}
        <div className="flex space-x-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'invoices'
                ? 'bg-[#075B46] text-white'
                : 'bg-[#F5F7F6] text-slate-700 hover:bg-slate-200'
            }`}
          >
            Factures & Échéanciers ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'payments'
                ? 'bg-[#075B46] text-white'
                : 'bg-[#F5F7F6] text-slate-700 hover:bg-slate-200'
            }`}
          >
            Historique des Encaissements ({payments.length})
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher élève ou n°..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-[#F5F7F6] focus:outline-hidden"
            />
          </div>

          {activeTab === 'invoices' && (
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Soldé</option>
              <option value="partial">Partiel</option>
              <option value="unpaid">Impayé</option>
            </select>
          )}
        </div>

      </div>

      {/* Invoices List */}
      {activeTab === 'invoices' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
                <tr>
                  <th className="py-3 px-4">N° Facture</th>
                  <th className="py-3 px-4">Élève & Matricule</th>
                  <th className="py-3 px-4 text-right">Montant Total</th>
                  <th className="py-3 px-4 text-right">Déjà Versé</th>
                  <th className="py-3 px-4 text-right">Solde Dû</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#075B46]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#17201D]">
                      {inv.studentName}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                      {formatCurrency(inv.amountPaid, inv.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#D9822B]">
                      {formatCurrency(inv.balanceRemaining, inv.currency)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.balanceRemaining > 0 && canCreatePayment ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#075B46] text-white hover:bg-[#0B8064] rounded-md transition-colors"
                        >
                          Encaisser
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Soldé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Payments & Receipts List */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F6] border-b border-slate-200 text-[#66736D] font-semibold">
                <tr>
                  <th className="py-3 px-4">N° Reçu</th>
                  <th className="py-3 px-4">Date du Versement</th>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Mode de Règlement</th>
                  <th className="py-3 px-4 text-right">Montant Encaissé</th>
                  <th className="py-3 px-4">Perçu Par</th>
                  <th className="py-3 px-4 text-right">Reçu Officiel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#075B46]">
                      {pay.receiptNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(pay.paidAt).toLocaleDateString()} {new Date(pay.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#17201D]">
                      {pay.studentName}
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold text-slate-600">
                      {pay.paymentMethod} {pay.referenceNumber && `(${pay.referenceNumber})`}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sm text-[#075B46]">
                      {formatCurrency(pay.amount, pay.currency)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pay.receivedByUserId || 'Caisse Général'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(pay)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#075B46] hover:underline"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimer</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#17201D]">
                  Encaissement d'un Versement
                </h3>
                <p className="text-xs text-[#66736D]">
                  Émission immédiate du reçu officiel REC-2024-XXXXX
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              
              <div className="p-3 bg-[#F5F7F6] rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Élève bénéficiaire :</span>
                  <span className="font-bold text-[#17201D]">{selectedInvoice.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facture liée :</span>
                  <span className="font-mono text-[#075B46]">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="text-slate-500">Solde restant dû :</span>
                  <span className="font-bold text-[#D9822B]">
                    {formatCurrency(selectedInvoice.balanceRemaining, selectedInvoice.currency)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Montant versé *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedInvoice.balanceRemaining}
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold text-[#075B46]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Devise *</label>
                  <select
                    value={paymentForm.currency}
                    onChange={e => setPaymentForm({ ...paymentForm, currency: e.target.value as Currency })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="HTG">HTG (Gourdes haïtiennes)</option>
                    <option value="USD">USD (Dollars américains)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">Mode de règlement *</label>
                  <select
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="cash">Espèces en caisse</option>
                    <option value="moncash">MonCash</option>
                    <option value="natcash">Natcash</option>
                    <option value="bank_transfer">Virement Bancaire (SOGEBANK / BNC)</option>
                    <option value="card">Carte bancaire</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#17201D] mb-1">N° de référence / Chèque</label>
                  <input
                    type="text"
                    placeholder="ex. MC-8893910"
                    value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17201D] mb-1">Libellé / Note</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075B46] text-white rounded-lg hover:bg-[#0B8064] font-semibold"
                >
                  Confirmer & Émettre le Reçu
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="no-print p-4 border-b border-slate-200 bg-[#F5F7F6] flex items-center justify-between">
              <span className="text-xs font-bold text-[#075B46]">Aperçu du Reçu Officiel</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#075B46] text-white rounded text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-8 text-[#17201D] text-xs space-y-4">
              
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm uppercase text-[#075B46]">{currentSchool.name}</h3>
                  <p className="text-[11px] text-slate-500">{currentSchool.address} • {currentSchool.city}</p>
                  <p className="text-[10px] text-slate-500">Tél : {currentSchool.phone}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-[#075B46]">{selectedReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(selectedReceipt.paidAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-center py-1">
                <span className="font-bold uppercase tracking-wider text-xs border-b border-slate-300 pb-0.5">
                  REÇU DE PAIEMENT SCOLARITÉ
                </span>
              </div>

              <div className="bg-[#F5F7F6] p-3 rounded border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Reçu de :</span>
                  <span className="font-bold text-[#17201D]">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pour le compte de :</span>
                  <span>Frais de scolarité & Écolage 2024-2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mode de paiement :</span>
                  <span className="uppercase font-medium">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-4 bg-[#DDF3EA]/60 rounded border border-[#BCE6D6] flex justify-between items-center">
                <span className="font-bold text-slate-800">Montant Reçu :</span>
                <span className="text-lg font-mono font-bold text-[#075B46]">
                  {formatCurrency(selectedReceipt.amount, selectedReceipt.currency)}
                </span>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[11px]">
                <div>
                  <span className="text-slate-500 block">Signature du Payeur</span>
                  <div className="h-10 border-b border-dotted border-slate-400 mt-2"></div>
                </div>
                <div>
                  <span className="text-slate-500 block">Cachet & Signature de la Caisse</span>
                  <div className="h-10 border-b border-dotted border-slate-400 mt-2 flex items-center justify-center text-[10px] font-semibold text-[#075B46]">
                    {selectedReceipt.receivedByUserId || 'Service Comptabilité'}
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                Ce reçu certifie l'enregistrement comptable définitif dans le grand livre institutionnel EDUKA.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
