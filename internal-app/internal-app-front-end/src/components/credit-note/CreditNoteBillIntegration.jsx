import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiChevronDown, FiChevronUp, FiCheck, FiInfo, FiX } from 'react-icons/fi';

/**
 * CreditNoteBillIntegration — Shows available credit notes during billing
 * and allows the operator to apply them as adjustments against the bill.
 *
 * Props:
 *   customerId       — Pharmacy/customer ID to fetch credit notes for
 *   billAmount       — Current bill grand total (to cap usage)
 *   onApplyCredit    — (appliedNotes[]) => void — called when credits are applied
 *   appliedCredits   — Currently applied credit notes (controlled by parent)
 *   onRemoveCredit   — (creditNoteId) => void — remove an applied credit note
 */

const formatCurrency = (amount) =>
  `\u20B9${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function CreditNoteBillIntegration({
  customerId,
  billAmount = 0,
  appliedCredits = [],
  onApplyCredit,
  onRemoveCredit,
}) {
  const [availableNotes, setAvailableNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');

  // ===== Fetch Available Credit Notes =====
  const fetchAvailableNotes = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError('');
    try {
      // Import dynamically to avoid circular deps — or use the service directly
      const creditNoteService = (await import('../../services/creditNoteService')).default;
      const response = await creditNoteService.getAvailableForBilling(customerId);
      setAvailableNotes(Array.isArray(response) ? response : response.creditNotes || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load credit notes');
      setAvailableNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchAvailableNotes();
  }, [fetchAvailableNotes]);

  // ===== Calculate Totals =====
  const totalAvailable = availableNotes.reduce((sum, cn) => sum + (cn.remainingAmount || 0), 0);
  const totalApplied = appliedCredits.reduce((sum, cn) => sum + (cn.amountUsed || 0), 0);
  const maxApplicable = Math.min(totalAvailable, billAmount);
  const remainingAfterCredit = Math.max(0, billAmount - totalApplied);

  // ===== Toggle a credit note =====
  const handleToggleCredit = (creditNote) => {
    const isApplied = appliedCredits.some((c) => c.creditNoteId === creditNote.creditNoteId);
    if (isApplied) {
      onRemoveCredit?.(creditNote.creditNoteId);
    } else {
      // Calculate how much can be used
      const usableAmount = Math.min(creditNote.remainingAmount, remainingAfterCredit);
      if (usableAmount <= 0) return;
      onApplyCredit?.([
        ...appliedCredits,
        {
          creditNoteId: creditNote.creditNoteId,
          amountUsed: usableAmount,
          creditNoteNumber: creditNote.creditNoteId,
          returnType: creditNote.returnType,
          remainingAmount: creditNote.remainingAmount,
          expiryDate: creditNote.creditUsageExpiry,
        },
      ]);
    }
  };

  // ===== Adjust amount for a credit note =====
  const handleAmountChange = (creditNoteId, newAmount) => {
    const creditNote = availableNotes.find((cn) => cn.creditNoteId === creditNoteId);
    if (!creditNote) return;

    const maxAllowed = Math.min(creditNote.remainingAmount, remainingAfterCredit + 
      (appliedCredits.find((c) => c.creditNoteId === creditNoteId)?.amountUsed || 0));
    const clampedAmount = Math.min(Math.max(0, Number(newAmount)), maxAllowed);

    const updated = appliedCredits.map((c) =>
      c.creditNoteId === creditNoteId ? { ...c, amountUsed: clampedAmount } : c
    );
    onApplyCredit?.(updated);
  };

  // ===== Apply All Available =====
  const handleApplyAll = () => {
    let remaining = billAmount - totalApplied;
    const allCredits = [...appliedCredits];
    
    for (const cn of availableNotes) {
      if (remaining <= 0) break;
      const alreadyApplied = allCredits.find((c) => c.creditNoteId === cn.creditNoteId);
      if (alreadyApplied) continue;
      
      const usableAmount = Math.min(cn.remainingAmount, remaining);
      if (usableAmount > 0) {
        allCredits.push({
          creditNoteId: cn.creditNoteId,
          amountUsed: usableAmount,
          creditNoteNumber: cn.creditNoteId,
          returnType: cn.returnType,
          remainingAmount: cn.remainingAmount,
          expiryDate: cn.creditUsageExpiry,
        });
        remaining -= usableAmount;
      }
    }
    onApplyCredit?.(allCredits);
  };

  // ===== Remove All =====
  const handleRemoveAll = () => {
    onApplyCredit?.([]);
  };

  const returnTypeLabels = {
    EXPIRY: { label: 'Expiry', icon: '📅', color: 'text-red-600' },
    BREAKAGE_DAMAGE: { label: 'Breakage', icon: '💔', color: 'text-orange-600' },
    GOOD_RETURN: { label: 'Return', icon: '✅', color: 'text-green-600' },
  };

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/30">
      {/* Header — Collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <FiCreditCard className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Credit Notes</p>
            <p className="text-xs text-gray-500">
              {availableNotes.length > 0
                ? `${availableNotes.length} available - ${formatCurrency(totalAvailable)} total`
                : 'No credit notes available'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalApplied > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <FiCheck className="w-3 h-3" />
              {formatCurrency(totalApplied)} applied
            </span>
          )}
          {isExpanded ? (
            <FiChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <FiChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-blue-200 px-4 py-3 space-y-3">
          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
            <FiInfo className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p>
              Apply available credit notes to reduce the bill amount. Credit notes are automatically
              sorted by expiry date (soonest first). You can adjust the amount used per credit note.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">
              <FiX className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-4 text-sm text-gray-400">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-2" />
              Loading credit notes...
            </div>
          )}

          {/* No Credit Notes */}
          {!isLoading && availableNotes.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-400">
              No credit notes available for this customer
            </div>
          )}

          {/* Credit Notes List */}
          {!isLoading && availableNotes.length > 0 && (
            <>
              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Bill: {formatCurrency(billAmount)} · Remaining: {formatCurrency(remainingAfterCredit)}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleApplyAll}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Apply All
                  </button>
                  {appliedCredits.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveAll}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove All
                    </button>
                  )}
                </div>
              </div>

              {/* Credit Note Items */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableNotes.map((cn) => {
                  const applied = appliedCredits.find((c) => c.creditNoteId === cn.creditNoteId);
                  const isApplied = !!applied;
                  const rtInfo = returnTypeLabels[cn.returnType] || {};
                  const isExpired = cn.creditUsageExpiry && new Date(cn.creditUsageExpiry) < new Date();

                  return (
                    <div
                      key={cn.creditNoteId}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                        isApplied
                          ? 'border-blue-300 bg-blue-50'
                          : isExpired
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                      onClick={() => !isExpired && handleToggleCredit(cn)}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isApplied ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {isApplied && <FiCheck className="w-3 h-3 text-white" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 font-mono">
                            {cn.creditNoteId}
                          </span>
                          <span className={`text-xs ${rtInfo.color}`}>
                            {rtInfo.icon} {rtInfo.label}
                          </span>
                          {isExpired && (
                            <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Expired</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Available: {formatCurrency(cn.remainingAmount)}
                          {cn.creditUsageExpiry && (
                            <span className="ml-2">
                              Expires: {new Date(cn.creditUsageExpiry).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Amount Input (when applied) */}
                      {isApplied && (
                        <div
                          className="flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                            <input
                              type="number"
                              value={applied.amountUsed}
                              onChange={(e) => handleAmountChange(cn.creditNoteId, e.target.value)}
                              min={0}
                              max={Math.min(cn.remainingAmount, billAmount - totalApplied + applied.amountUsed)}
                              step={0.01}
                              className="w-28 pl-6 pr-2 py-1.5 text-sm text-right border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Applied Summary */}
              {appliedCredits.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-green-800">Total Credit Applied</span>
                    <span className="font-bold text-green-700">{formatCurrency(totalApplied)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-green-600 mt-1">
                    <span>Net Payable</span>
                    <span className="font-semibold">{formatCurrency(remainingAfterCredit)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
