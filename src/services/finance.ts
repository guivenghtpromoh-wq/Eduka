/**
 * EDUKA - Multi-Currency Finance, Invoicing & Recouvrement Engine
 * Supports HTG (Gourdes) & USD with configurable exchange rates, partial installments and audit trails.
 */

import { Invoice, PaymentTransaction, School } from '../types';
import { db } from './db';

export function formatCurrency(amount: number, currency: 'HTG' | 'USD'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // HTG (Gourde Haïtienne)
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' HTG';
}

export function convertCurrency(
  amount: number,
  from: 'HTG' | 'USD',
  to: 'HTG' | 'USD',
  rate: number
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'HTG') return amount * rate;
  return amount / rate;
}

export interface FinanceSummary {
  totalInvoicedHtg: number;
  totalPaidHtg: number;
  totalBalanceHtg: number;
  collectionRatePercentage: number;
  invoiceCount: number;
  paidInFullCount: number;
  partialCount: number;
  unpaidCount: number;
}

export function calculateFinanceSummary(schoolId: string, exchangeRate: number): FinanceSummary {
  const invoices = db.getInvoices(schoolId);
  
  let totalInvoicedHtg = 0;
  let totalPaidHtg = 0;
  let totalBalanceHtg = 0;

  let paidInFullCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  invoices.forEach(inv => {
    const netDue = inv.currency === 'USD' ? inv.netAmountDue * exchangeRate : inv.netAmountDue;
    const paid = inv.currency === 'USD' ? inv.amountPaid * exchangeRate : inv.amountPaid;
    const balance = inv.currency === 'USD' ? inv.balanceRemaining * exchangeRate : inv.balanceRemaining;

    totalInvoicedHtg += netDue;
    totalPaidHtg += paid;
    totalBalanceHtg += balance;

    if (inv.status === 'paid') paidInFullCount++;
    else if (inv.status === 'partial') partialCount++;
    else unpaidCount++;
  });

  const collectionRate = totalInvoicedHtg > 0 ? (totalPaidHtg / totalInvoicedHtg) * 100 : 0;

  return {
    totalInvoicedHtg,
    totalPaidHtg,
    totalBalanceHtg,
    collectionRatePercentage: Math.round(collectionRate * 10) / 10,
    invoiceCount: invoices.length,
    paidInFullCount,
    partialCount,
    unpaidCount
  };
}
