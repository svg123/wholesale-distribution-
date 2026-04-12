import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  submitRequestStart,
  submitRequestSuccess,
  submitRequestFailure,
} from '../redux/slices/requestSlice';
import {
  MISMATCH_ISSUE_TYPES,
  MISMATCH_ISSUE_CONFIG,
} from '../utils/constants';
import { FiSend, FiPlus, FiMinus, FiFlag, FiEdit3, FiInfo, FiArrowLeft } from 'react-icons/fi';

const REQUEST_MODE = {
  MODIFICATION: 'MODIFICATION',
  MISMATCH: 'MISMATCH',
};

export default function RequestRaiserPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-filled data from SubStationDetail navigation
  const prefill = location.state?.mode === 'MISMATCH' ? location.state : null;
  const returnPath = location.state?.returnPath || null;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(prefill ? REQUEST_MODE.MISMATCH : REQUEST_MODE.MODIFICATION);
  const [submittedData, setSubmittedData] = useState(null);

  // Modification form
  const [modForm, setModForm] = useState({
    orderId: '',
    productName: '',
    productId: '',
    operation: 'SUBTRACT',
    quantity: '',
    reason: '',
  });

  // Mismatch ticket form — pre-filled if coming from SubStationDetail
  const [mismatchForm, setMismatchForm] = useState({
    orderId: prefill?.orderId || '',
    productName: prefill?.productName || '',
    productId: prefill?.productId || '',
    substation: prefill?.substation || '',
    issueType: MISMATCH_ISSUE_TYPES.QUANTITY,
    requiredQty: prefill?.requiredQty ? String(prefill.requiredQty) : '',
    enteredQty: prefill?.enteredQty ? String(prefill.enteredQty) : '',
    batchDetails: prefill?.enteredBatches?.length
      ? prefill.enteredBatches.map((b) => `${b.batchNumber}: ${b.quantity}`).join('\n')
      : '',
    reason: '',
  });

  // Clear location.state after reading so it doesn't persist on refresh
  useEffect(() => {
    if (prefill) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleModChange = (e) => {
    const { name, value } = e.target;
    setModForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMismatchChange = (e) => {
    const { name, value } = e.target;
    setMismatchForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(submitRequestStart());

    try {
      setTimeout(() => {
        let payload;

        if (mode === REQUEST_MODE.MODIFICATION) {
          payload = {
            id: `REQ-${Date.now().toString().slice(-6)}`,
            orderId: modForm.orderId,
            productName: modForm.productName,
            productId: modForm.productId,
            type: modForm.operation,
            quantity: Number(modForm.quantity),
            reason: modForm.reason,
            status: 'PENDING',
            requestedBy: 'Current User',
            createdAt: new Date().toISOString(),
          };
        } else {
          payload = {
            id: `TKT-${Date.now().toString().slice(-6)}`,
            orderId: mismatchForm.orderId,
            productName: mismatchForm.productName,
            productId: mismatchForm.productId,
            substation: mismatchForm.substation,
            type: 'MISMATCH',
            issueType: mismatchForm.issueType,
            requiredQty: Number(mismatchForm.requiredQty),
            quantity: Number(mismatchForm.enteredQty),
            enteredBatches: mismatchForm.batchDetails
              ? mismatchForm.batchDetails.split('\n').filter(Boolean).map((line) => {
                  const parts = line.split(':').map((s) => s.trim());
                  return { batchNumber: parts[0] || '', quantity: Number(parts[1]) || 0 };
                })
              : [],
            reason: mismatchForm.reason || `${mismatchForm.issueType} mismatch`,
            status: 'PENDING',
            requestedBy: 'Current User',
            createdAt: new Date().toISOString(),
          };
        }

        dispatch(submitRequestSuccess(payload));
        setSubmittedData(payload);
        setSubmitted(true);
        setLoading(false);
      }, 600);
    } catch (err) {
      dispatch(submitRequestFailure(err.message));
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMode(REQUEST_MODE.MODIFICATION);
    setModForm({
      orderId: '',
      productName: '',
      productId: '',
      operation: 'SUBTRACT',
      quantity: '',
      reason: '',
    });
    setMismatchForm({
      orderId: '',
      productName: '',
      productId: '',
      substation: '',
      issueType: MISMATCH_ISSUE_TYPES.QUANTITY,
      requiredQty: '',
      enteredQty: '',
      batchDetails: '',
      reason: '',
    });
    setSubmitted(false);
    setSubmittedData(null);
  };

  const handleGoBack = () => {
    if (returnPath) {
      navigate(returnPath);
    } else {
      handleReset();
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Raise Request</h1>
        </div>
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {submittedData?.type === 'MISMATCH' ? 'Mismatch Ticket Raised' : 'Request Submitted'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {submittedData?.type === 'MISMATCH'
                ? 'Your mismatch ticket has been submitted for Manager/Admin review.'
                : 'Your modification request has been sent for approval.'}
            </p>

            {/* Submitted details summary */}
            {submittedData && (
              <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2 mb-6 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono font-medium text-gray-900">{submittedData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order</span>
                  <span className="font-medium text-gray-900">{submittedData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product</span>
                  <span className="font-medium text-gray-900">{submittedData.productName}</span>
                </div>
                {submittedData.type === 'MISMATCH' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Issue Type</span>
                      <span className="font-medium text-gray-900">
                        {MISMATCH_ISSUE_CONFIG[submittedData.issueType]?.label || submittedData.issueType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required Qty</span>
                      <span className="font-medium text-gray-900">{submittedData.requiredQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Entered Qty</span>
                      <span className="font-bold text-red-600">{submittedData.quantity}</span>
                    </div>
                  </>
                )}
                {submittedData.type !== 'MISMATCH' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-medium text-gray-900">{submittedData.quantity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="badge-warning">Pending Review</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {returnPath && (
                <button onClick={handleGoBack} className="btn-secondary">
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sub-Station
                </button>
              )}
              <button onClick={handleReset} className="btn-primary">
                Raise Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          {returnPath && (
            <button
              onClick={handleGoBack}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 mb-2"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Sub-Station
            </button>
          )}
          <h1 className="page-title">Raise Request</h1>
          <p className="page-subtitle">Submit an order modification request or raise a mismatch ticket</p>
        </div>
      </div>

      {/* Pre-filled context banner from Sub-Station */}
      {prefill && (
        <div className="card border-l-4 border-l-red-400 bg-red-50/50">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiFlag className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-red-900 mb-1">
                  Raising Mismatch Ticket from Sub-Station
                </h4>
                <p className="text-xs text-red-700 mb-2">
                  The following details have been auto-filled from the sub-station processing. Please select the issue type and provide a description.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-red-500">Order</span>
                    <p className="font-mono font-medium text-red-900">{prefill.orderId}</p>
                  </div>
                  <div>
                    <span className="text-red-500">Product</span>
                    <p className="font-medium text-red-900">{prefill.productName}</p>
                  </div>
                  <div>
                    <span className="text-red-500">Sub-Station</span>
                    <p className="font-medium text-red-900">{prefill.substation}</p>
                  </div>
                  <div>
                    <span className="text-red-500">Qty Mismatch</span>
                    <p className="font-medium text-red-900">
                      <span className="text-red-700 font-bold">{prefill.enteredQty}</span>
                      <span className="text-red-400 mx-0.5">/</span>
                      {prefill.requiredQty}
                    </p>
                  </div>
                </div>
                {prefill.enteredBatches?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-red-500 text-xs">Batch(es): </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {prefill.enteredBatches.map((b, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs font-mono border border-red-200">
                          {b.batchNumber}: <span className="font-medium text-red-700">{b.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        {/* Mode Toggle — hidden when pre-filled from substation */}
        {!prefill ? (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode(REQUEST_MODE.MODIFICATION)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                mode === REQUEST_MODE.MODIFICATION
                  ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <FiEdit3 className="w-4 h-4" />
              Modification Request
            </button>
            <button
              type="button"
              onClick={() => setMode(REQUEST_MODE.MISMATCH)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                mode === REQUEST_MODE.MISMATCH
                  ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <FiFlag className="w-4 h-4" />
              Mismatch Ticket
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold">
              <FiFlag className="w-3.5 h-3.5" />
              Mismatch Ticket Mode
            </span>
            <span className="text-xs text-gray-400">— auto-filled from sub-station</span>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">
              {mode === REQUEST_MODE.MODIFICATION
                ? 'New Modification Request'
                : 'New Mismatch Ticket'}
            </h3>
            {mode === REQUEST_MODE.MISMATCH && (
              <span className="badge-danger">Sub-Station Issue</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-5">
            {/* Common: Order ID */}
            <div>
              <label className="label">Sales Order ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="orderId"
                value={mode === REQUEST_MODE.MODIFICATION ? modForm.orderId : mismatchForm.orderId}
                onChange={mode === REQUEST_MODE.MODIFICATION ? handleModChange : handleMismatchChange}
                className="input-field"
                placeholder="e.g., ORD-20260408-001"
                required
                readOnly={mode === REQUEST_MODE.MISMATCH && !!prefill}
              />
            </div>

            {/* Common: Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="productName"
                  value={mode === REQUEST_MODE.MODIFICATION ? modForm.productName : mismatchForm.productName}
                  onChange={mode === REQUEST_MODE.MODIFICATION ? handleModChange : handleMismatchChange}
                  className="input-field"
                  placeholder="e.g., Telmikind 20"
                  required
                  readOnly={mode === REQUEST_MODE.MISMATCH && !!prefill}
                />
              </div>
              <div>
                <label className="label">Product ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="productId"
                  value={mode === REQUEST_MODE.MODIFICATION ? modForm.productId : mismatchForm.productId}
                  onChange={mode === REQUEST_MODE.MODIFICATION ? handleModChange : handleMismatchChange}
                  className="input-field"
                  placeholder="e.g., PROD-001"
                  required
                  readOnly={mode === REQUEST_MODE.MISMATCH && !!prefill}
                />
              </div>
            </div>

            {/* ── Mode-specific fields ─────────────────────────── */}
            {mode === REQUEST_MODE.MODIFICATION ? (
              <>
                {/* Operation & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Operation <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModForm((prev) => ({ ...prev, operation: 'SUBTRACT' }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          modForm.operation === 'SUBTRACT'
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FiMinus className="w-4 h-4" /> Subtract
                      </button>
                      <button
                        type="button"
                        onClick={() => setModForm((prev) => ({ ...prev, operation: 'ADD' }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          modForm.operation === 'ADD'
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FiPlus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="quantity"
                      value={modForm.quantity}
                      onChange={handleModChange}
                      className="input-field"
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Sub-Station */}
                <div>
                  <label className="label">Sub-Station <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="substation"
                    value={mismatchForm.substation}
                    onChange={handleMismatchChange}
                    className="input-field"
                    placeholder="e.g., Abbott India"
                    required
                    readOnly={!!prefill}
                  />
                </div>

                {/* Issue Type */}
                <div>
                  <label className="label">Issue Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(MISMATCH_ISSUE_TYPES).map(([, value]) => {
                      const config = MISMATCH_ISSUE_CONFIG[value];
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setMismatchForm((prev) => ({ ...prev, issueType: value }))
                          }
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-colors ${
                            mismatchForm.issueType === value
                              ? 'border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-base">{config.icon}</span>
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Required vs Entered Qty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Required Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="requiredQty"
                      value={mismatchForm.requiredQty}
                      onChange={handleMismatchChange}
                      className="input-field"
                      placeholder="Expected qty"
                      min="0"
                      required
                      readOnly={!!prefill}
                    />
                  </div>
                  <div>
                    <label className="label">Entered Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="enteredQty"
                      value={mismatchForm.enteredQty}
                      onChange={handleMismatchChange}
                      className="input-field border-red-300 bg-red-50/50"
                      placeholder="Actual qty processed"
                      min="0"
                      required
                      readOnly={!!prefill}
                    />
                  </div>
                </div>

                {/* Batch Details */}
                <div>
                  <label className="label">
                    Batch Details{' '}
                    <span className="text-gray-400 font-normal">
                      {prefill ? '(auto-filled)' : '(optional)'}
                    </span>
                  </label>
                  <textarea
                    name="batchDetails"
                    value={mismatchForm.batchDetails}
                    onChange={handleMismatchChange}
                    className={`input-field min-h-[60px] resize-none font-mono text-xs ${prefill ? 'bg-gray-50' : ''}`}
                    placeholder={prefill ? '' : 'Enter batch details, one per line:\nBN-001: 50\nBN-002: 30'}
                    readOnly={!!prefill}
                  />
                  {!prefill && (
                    <p className="text-xs text-gray-400 mt-1">Format: BatchNumber: Quantity (one per line)</p>
                  )}
                </div>

                {/* Info note for mismatch */}
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <FiInfo className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    This mismatch ticket will be reviewed by the Manager/Admin. Include as much detail as possible to expedite the approval process.
                  </p>
                </div>
              </>
            )}

            {/* Reason / Description */}
            <div>
              <label className="label">
                {mode === REQUEST_MODE.MODIFICATION ? 'Reason' : 'Description'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={mode === REQUEST_MODE.MODIFICATION ? modForm.reason : mismatchForm.reason}
                onChange={mode === REQUEST_MODE.MODIFICATION ? handleModChange : handleMismatchChange}
                className="input-field min-h-[80px] resize-none"
                placeholder={
                  mode === REQUEST_MODE.MODIFICATION
                    ? 'Describe the reason for this modification...'
                    : 'Describe the mismatch issue in detail...'
                }
                required
                autoFocus={!!prefill}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              {returnPath && (
                <button type="button" onClick={handleGoBack} className="btn-secondary">
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              )}
              <button type="button" onClick={handleReset} className="btn-secondary">
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${
                  mode === REQUEST_MODE.MISMATCH
                    ? 'bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : mode === REQUEST_MODE.MISMATCH ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiFlag className="w-4 h-4" /> Raise Mismatch Ticket
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiSend className="w-4 h-4" /> Submit Request
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
