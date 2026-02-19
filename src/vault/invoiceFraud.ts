/**
 * Invoice fraud detection.
 */

export interface FraudCheckResult {
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
}

export interface InvoiceInput {
  amount: number;
  payee?: string;
  vendor?: string;
  reference?: string;
  invoiceNumber?: string;
  currency?: string;
  dueDate?: string;
}

export function checkInvoice(invoice: InvoiceInput): FraudCheckResult {
  const payee = invoice.payee ?? invoice.vendor ?? 'Unknown';
  const flags: string[] = [];
  let riskScore = 0;

  if (invoice.amount > 50000) { flags.push('High-value invoice'); riskScore += 15; }
  if (invoice.amount <= 0) { flags.push('Non-positive amount'); riskScore += 30; }
  if (!invoice.reference && !invoice.invoiceNumber) { flags.push('Missing reference number'); riskScore += 10; }
  if (/test|fake|dummy/i.test(payee)) { flags.push('Suspicious payee name'); riskScore += 25; }
  if (payee.length < 3) { flags.push('Payee name too short'); riskScore += 15; }
  if (invoice.dueDate) {
    const due = new Date(invoice.dueDate);
    if (due.getTime() < Date.now() - 86400000 * 365) { flags.push('Due date over a year ago'); riskScore += 20; }
  }
  // Round number check
  if (invoice.amount > 1000 && invoice.amount % 1000 === 0) { flags.push('Suspiciously round amount'); riskScore += 5; }

  riskScore = Math.min(100, riskScore);
  const riskLevel = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : riskScore >= 20 ? 'low' : 'safe';
  return { riskScore, riskLevel, flags };
}
