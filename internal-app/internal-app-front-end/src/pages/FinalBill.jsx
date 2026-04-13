import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiTruck,
  FiHash,
  FiPackage,
  FiCheck,
  FiLoader,
  FiCopy,
} from 'react-icons/fi';
import billService from '../services/billService';
import CreditNoteBillIntegration from '../components/credit-note/CreditNoteBillIntegration';

// ── Helpers ──────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Bill Status Config ───────────────────────────────────────────
const BILL_STATUS_CONFIG = {
  GENERATING: { label: 'Generating...', color: 'badge-warning', icon: FiLoader },
  GENERATED:  { label: 'Generated',    color: 'badge-info',    icon: FiFileText },
  CONFIRMED:  { label: 'Confirmed',    color: 'badge-success', icon: FiCheckCircle },
};

export default function FinalBill() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const printRef = useRef(null);

  // Data from navigation state
  const passedState = location.state || {};

  // ── State ──────────────────────────────────────────────────────
  const [billState, setBillState] = useState('INPUT'); // INPUT | GENERATING | GENERATED | CONFIRMED
  const [discountPercent, setDiscountPercent] = useState(0);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedCredits, setAppliedCredits] = useState([]);

  // Clear location state after reading
  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if no data
  useEffect(() => {
    if (!passedState.products || !passedState.products.length) {
      // No data passed — redirect back
      navigate(-1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────
  const handleGenerateBill = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const result = await billService.generateBill({
        orderId: passedState.orderId || orderId,
        customer: passedState.customer,
        substation: passedState.substation,
        substationId: passedState.substationId,
        products: passedState.products,
        discountPercent: Number(discountPercent) || 0,
      });
      setBill(result);
      setBillState('GENERATED');
    } catch (err) {
      setError(err.message || 'Failed to generate bill');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmBill = async () => {
    setIsConfirming(true);
    setError('');
    try {
      await billService.confirmBill(bill.billNumber);
      setBill((prev) => ({ ...prev, status: 'CONFIRMED', confirmedAt: new Date().toISOString() }));
      setBillState('CONFIRMED');
    } catch (err) {
      setError(err.message || 'Failed to confirm bill');
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBillNumber = () => {
    if (bill) {
      navigator.clipboard.writeText(bill.billNumber).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // ── Guard ──────────────────────────────────────────────────────
  if (!passedState.products) return null;

  // ── Render: Step 1 – Discount Input ────────────────────────────
  const renderInputStep = () => (
    <div className="card">
      <div className="card-body">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Generate Final Bill
            </h2>
            <p className="text-sm text-gray-500">
              Review order details and generate the sales invoice for{' '}
              <span className="font-medium text-gray-700">{passedState.customer}</span>
            </p>
          </div>

          {/* Order Summary Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order Number</span>
              <span className="font-mono font-medium text-gray-900">{passedState.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-gray-900">{passedState.customer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sub-Station</span>
              <span className="font-medium text-gray-900">{passedState.substation}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Products</span>
              <span className="font-medium text-gray-900">
                {passedState.products.length} item(s) — {passedState.products.reduce((s, p) => s + (Number(p.processedQty) || Number(p.requiredQty)), 0)} units
              </span>
            </div>
          </div>

          {/* Products Quick List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Batch(es)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {passedState.products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-3 py-2 text-sm text-center text-gray-700">{p.requiredQty}</td>
                    <td className="px-3 py-2 text-center">
                      {(p.batches || []).filter((b) => b.batchNumber).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Discount Input */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FiPercent className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Discount (Optional)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="input-field pl-4 text-center font-medium"
                  placeholder="0"
                />
              </div>
              <span className="text-sm text-gray-500">%</span>
              {Number(discountPercent) > 0 && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {discountPercent}% off
                </span>
              )}
            </div>
          </div>

          {/* Credit Note Integration */}
          <CreditNoteBillIntegration
            customerId={passedState.customerCode || passedState.customer}
            billAmount={passedState.estimatedAmount || 0}
            appliedCredits={appliedCredits}
            onApplyCredit={setAppliedCredits}
            onRemoveCredit={(cnId) => setAppliedCredits((prev) => prev.filter((c) => c.creditNoteId !== cnId))}
          />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              onClick={handleGenerateBill}
              className="btn-primary"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Generating Bill...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiFileText className="w-4 h-4" />
                  Generate Bill
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render: Bill (Generated / Confirmed) ───────────────────────
  const renderBill = () => {
    const statusCfg = BILL_STATUS_CONFIG[bill.status] || BILL_STATUS_CONFIG.GENERATED;
    const StatusIcon = statusCfg.icon;

    return (
      <>
        {/* Top Action Bar — hidden in print */}
        <div className="flex items-center justify-between print:hidden">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex gap-2">
            {billState === 'GENERATED' && (
              <button
                onClick={handleConfirmBill}
                className="btn-success flex items-center gap-2"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
                Confirm Bill
              </button>
            )}
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* ── Invoice Card ────────────────────────────────────────── */}
        <div ref={printRef} className="card print:shadow-none print:border print:border-gray-300">
          <div className="card-body">
            {/* ── Header: Company + Bill Meta ──────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-gray-200">
              {/* Company */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    IVR
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">IVR Pharma</h1>
                    <p className="text-xs text-gray-500">Pharmaceutical Distribution</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                  <p>123 Industrial Area, Sector 7</p>
                  <p>Gurugram, Haryana — 122001</p>
                  <p>GSTIN: 06AABCI1234F1Z5</p>
                  <p>Ph: +91-124-4567890</p>
                </div>
              </div>

              {/* Bill Meta */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{bill.billNumber}</h2>
                  <button
                    onClick={handleCopyBillNumber}
                    className="p-1 text-gray-400 hover:text-gray-600 print:hidden"
                    title="Copy bill number"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600 print:hidden">Copied!</span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color} print:hidden`}>
                  <StatusIcon className={`w-3 h-3 ${bill.status === 'GENERATING' ? 'animate-spin' : ''}`} />
                  {statusCfg.label}
                </span>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center justify-end gap-1.5">
                    <FiCalendar className="w-3 h-3" />
                    <span>Bill Date: <span className="font-medium text-gray-700">{formatDate(bill.createdAt)}</span></span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <FiCalendar className="w-3 h-3" />
                    <span>Due Date: <span className="font-medium text-gray-700">{formatDate(bill.dueDate)}</span></span>
                  </div>
                  {bill.confirmedAt && (
                    <div className="flex items-center justify-end gap-1.5">
                      <FiCheckCircle className="w-3 h-3 text-green-500" />
                      <span>Confirmed: <span className="font-medium text-green-700">{formatDateTime(bill.confirmedAt)}</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Bill To Section ──────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
                <p className="text-sm font-semibold text-gray-900">{bill.customer}</p>
                <p className="text-xs text-gray-500 mt-1">Customer ID: CUST-{bill.orderId.replace('ORD-', '')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Dispatch From</p>
                <p className="text-sm font-semibold text-gray-900">{bill.substation}</p>
                <p className="text-xs text-gray-500 mt-1">Station ID: {bill.substationId}</p>
                <p className="text-xs text-gray-500">Order Ref: {bill.orderId}</p>
              </div>
            </div>

            {/* ── Line Items Table ─────────────────────────────────── */}
            <div className="py-6 border-b border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Item Details</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-8">#</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase">Batch</th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase w-20">Qty</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase w-28">Unit Price</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bill.lineItems.map((item, i) => {
                      // Render one row per batch, with rowspan for product name
                      const batchRows = item.batches.length || 1;
                      return item.batches.map((batch, bIdx) => (
                        <tr key={`${item.productId}-${bIdx}`} className="hover:bg-gray-50">
                          {bIdx === 0 && (
                            <>
                              <td
                                className="px-3 py-2 text-xs text-gray-400 align-top"
                                rowSpan={batchRows}
                              >
                                {i + 1}
                              </td>
                              <td
                                className="px-3 py-2 align-top"
                                rowSpan={batchRows}
                              >
                                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                <p className="text-xs text-gray-400">Req: {item.requiredQty}</p>
                              </td>
                            </>
                          )}
                          <td className="px-3 py-2 text-center">
                            <span className="inline-block text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {batch.batchNumber}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-700">{batch.quantity}</td>
                          <td className="px-3 py-2 text-sm text-right text-gray-600">{formatCurrency(batch.unitPrice)}</td>
                          <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(batch.amount)}
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Totals ───────────────────────────────────────────── */}
            <div className="py-6">
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(bill.subtotal)}</span>
                  </div>

                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Discount ({bill.discountPercent}%)
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(bill.discountAmount)}
                      </span>
                    </div>
                  )}

                  {appliedCredits.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">
                        Credit Note Adjustment
                      </span>
                      <span className="font-medium text-blue-600">
                        -{formatCurrency(appliedCredits.reduce((s, c) => s + c.amountUsed, 0))}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxable Amount</span>
                    <span className="font-medium text-gray-900">{formatCurrency(bill.taxableAmount)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CGST ({bill.gstRate / 2}%)</span>
                    <span className="font-medium text-gray-700">{formatCurrency(bill.cgst)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SGST ({bill.gstRate / 2}%)</span>
                    <span className="font-medium text-gray-700">{formatCurrency(bill.sgst)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Grand Total</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatCurrency(bill.grandTotal)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-right">
                    Incl. GST @ {bill.gstRate}% ({formatCurrency(bill.totalTax)})
                  </p>
                </div>
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────────────── */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Payment Terms</p>
                  <p>Net 30 days from bill date</p>
                  <p>Bank: HDFC Bank — A/C 50100123456789</p>
                  <p>IFSC: HDFC0001234</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Summary</p>
                  <p>Total Items: {bill.totalItems} units</p>
                  <p>Product Lines: {bill.totalLineItems}</p>
                  <p>Generated by: {user?.name || 'System'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Notes</p>
                  <p>This is a computer-generated invoice.</p>
                  <p>Goods once sold will not be taken back.</p>
                  <p>Subject to Gurugram jurisdiction.</p>
                </div>
              </div>

              {/* Signature Area */}
              <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  <p>E & O.E.</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-gray-300 mb-1" />
                  <p className="text-xs text-gray-500">Authorized Signatory</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-gray-300 mb-1" />
                  <p className="text-xs text-gray-500">Customer Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── Main Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header — hidden in print */}
      <div className="page-header print:hidden">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FiFileText className="w-5 h-5" />
            Final Bill
          </h1>
          <p className="page-subtitle">
            {passedState.orderId ? `Sales Invoice for Order ${passedState.orderId}` : 'Generate sales invoice'}
          </p>
        </div>
      </div>

      {/* Content */}
      {billState === 'INPUT' && renderInputStep()}
      {(billState === 'GENERATED' || billState === 'CONFIRMED') && bill && renderBill()}
    </div>
  );
}
