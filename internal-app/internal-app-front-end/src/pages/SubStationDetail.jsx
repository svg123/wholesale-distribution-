import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiFlag,
  FiExternalLink,
  FiFileText,
  FiMic,
  FiMicOff,
} from 'react-icons/fi';
import { hasSubstationAccess } from '../utils/permissions';
import {
  SUBSTATIONS,
  SUBSTATION_STATUS_CONFIG,
} from '../utils/constants';
import {
  getProductsForSubstation,
  submitProcessedProducts,
} from '../services/orderService';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { PageLoader } from '../components/common/LoadingSpinner';

// ── Workflow Steps ────────────────────────────────────────────────
const STEP = {
  ENTER_ORDER: 'ENTER_ORDER',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
};

// ── Helpers ───────────────────────────────────────────────────────
const createEmptyBatch = () => ({ batchNumber: '', quantity: '' });

/** Build initial batch array with one empty row */
const initBatches = () => [createEmptyBatch()];

// ── Tiny hook: voice input for a single field ─────────────────────
function useVoiceInput({ onResult }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
  }, []);

  const toggleListening = useCallback(() => {
    if (!isSupported) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (onResult) onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening, isSupported, onResult]);

  return { isListening, isSupported, toggleListening };
}

// ── VoiceInputField: input with inline mic button ──────────────────
function VoiceInputField({ value, onChange, placeholder, disabled, className, type = 'text' }) {
  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onResult: (text) => {
      if (type === 'number') {
        // Extract numbers from spoken text (e.g. "fifty" won't work, but "50" will)
        const num = text.replace(/[^0-9]/g, '');
        if (num) onChange({ target: { value: num } });
      } else {
        onChange({ target: { value: text.toUpperCase() } });
      }
    },
  });

  return (
    <div className="flex items-center gap-1">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      {isSupported && !disabled && (
        <button
          type="button"
          onClick={toggleListening}
          className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
            isListening
              ? 'bg-red-100 text-red-600 animate-pulse'
              : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
          }`}
          title={isListening ? 'Stop listening' : 'Voice input'}
        >
          {isListening ? <FiMicOff className="w-3.5 h-3.5" /> : <FiMic className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

export default function SubStationDetail() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const currentSubstation = SUBSTATIONS.find((s) => s.id === stationId);

  // Workflow state
  const [step, setStep] = useState(STEP.ENTER_ORDER);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Order & products state
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);

  // Redirect if invalid substation
  useEffect(() => {
    if (!currentSubstation) {
      navigate('/sub-stations');
      return;
    }
    if (user && !hasSubstationAccess(user, currentSubstation.name)) {
      navigate('/sub-stations');
    }
  }, [currentSubstation, user, navigate]);

  // ── Order Lookup ────────────────────────────────────────────────
  const handleLookupOrder = async () => {
    const id = orderIdInput.trim();
    if (!id) {
      setError('Please enter an Order ID');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const result = await getProductsForSubstation(id, currentSubstation.name);
      setOrder(result.order);
      setProducts(
        result.products.map((p) => ({
          ...p,
          batches: initBatches(),
          processedQty: 0,
          status: 'PENDING',
        }))
      );
      setStep(STEP.PROCESSING);
    } catch (err) {
      setError(err.message || 'Order not found');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLookupOrder();
  };

  // ── Batch Operations ────────────────────────────────────────────
  const addBatch = (productId) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          batches: [...p.batches, createEmptyBatch()],
          status: 'PENDING',
        };
      })
    );
  };

  const removeBatch = (productId, batchIndex) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (p.batches.length <= 1) return p; // keep at least one row
        const newBatches = p.batches.filter((_, i) => i !== batchIndex);
        const totalQty = newBatches.reduce((s, b) => s + Number(b.quantity || 0), 0);
        return {
          ...p,
          batches: newBatches,
          processedQty: totalQty,
          status: totalQty === p.requiredQty ? 'COMPLETED' : 'PENDING',
        };
      })
    );
  };

  const updateBatch = (productId, batchIndex, field, value) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newBatches = p.batches.map((b, i) => {
          if (i !== batchIndex) return b;
          return { ...b, [field]: value };
        });
        const totalQty = newBatches.reduce((s, b) => s + Number(b.quantity || 0), 0);
        return {
          ...p,
          batches: newBatches,
          processedQty: totalQty,
          status: totalQty === p.requiredQty ? 'COMPLETED' : 'PENDING',
        };
      })
    );
  };

  // ── Navigate to Request Raiser with pre-filled mismatch data ─────
  const handleRaiseIssue = (product) => {
    navigate('/request-raiser', {
      state: {
        mode: 'MISMATCH',
        orderId: order.orderNumber,
        productId: product.id,
        productName: product.name,
        substation: currentSubstation.displayName,
        requiredQty: product.requiredQty,
        enteredQty: product.processedQty,
        enteredBatches: product.batches
          .filter((b) => b.batchNumber.trim())
          .map((b) => ({ batchNumber: b.batchNumber, quantity: Number(b.quantity || 0) })),
        returnPath: `/sub-stations/${stationId}`,
      },
    });
  };

  // ── Validation & Submission ─────────────────────────────────────
  const handleSubmit = async () => {
    // Check for empty batch fields
    const invalidProducts = [];
    products.forEach((p) => {
      if (p.status === 'COMPLETED') return;
      const hasEmptyBatch = p.batches.some(
        (b) => !b.batchNumber.trim() || !b.quantity
      );
      if (hasEmptyBatch || p.batches.length === 0) {
        invalidProducts.push(p.id);
      }
    });

    if (invalidProducts.length > 0) {
      setError('Please fill in batch number and quantity for all batch rows.');
      return;
    }

    // Check for quantity mismatches
    const qtyMismatches = products.filter(
      (p) => p.status !== 'COMPLETED' && Number(p.processedQty) !== Number(p.requiredQty)
    );

    if (qtyMismatches.length > 0) {
      setError(
        `${qtyMismatches.length} product(s) have quantity mismatch. Please raise a mismatch ticket for each before submitting, or adjust quantities to match.`
      );
      return;
    }

    // Check all products are completed
    const incompleteProducts = products.filter((p) => p.status !== 'COMPLETED');
    if (incompleteProducts.length > 0) {
      setError('All products must be processed (quantities must match) before submission.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const processedData = products.map((p) => ({
        id: p.id,
        name: p.name,
        batches: p.batches,
        processedQty: Number(p.processedQty),
      }));

      const result = await submitProcessedProducts(
        order.id,
        currentSubstation.name,
        processedData
      );

      // Update local products state with results
      setProducts(
        products.map((p) => {
          const resultProduct = result.stationProducts.find((rp) => rp.id === p.id);
          return resultProduct ? { ...p, ...resultProduct } : p;
        })
      );

      if (result.allCompleted) {
        setStep(STEP.COMPLETED);
      } else {
        setError('Some products could not be completed. Please review.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(STEP.ENTER_ORDER);
    setOrderIdInput('');
    setOrder(null);
    setProducts([]);
    setError('');
  };

  const handleNewOrder = handleReset;

  // ── Computed Values ─────────────────────────────────────────────
  const totalProducts = products.length;
  const completedProducts = products.filter((p) => p.status === 'COMPLETED').length;
  const mismatchProducts = products.filter((p) => {
    if (p.status === 'COMPLETED') return false;
    return Number(p.processedQty) > 0 && Number(p.processedQty) !== Number(p.requiredQty);
  }).length;
  const pendingProducts = products.filter((p) => p.status === 'PENDING' || (p.status !== 'COMPLETED' && Number(p.processedQty) === 0)).length;

  // ── Guard ───────────────────────────────────────────────────────
  if (!currentSubstation) return null;

  const statusCfg = SUBSTATION_STATUS_CONFIG[currentSubstation.status] || {
    label: currentSubstation.status,
    color: 'gray',
  };

  // ── Render: Step 1 – Enter Order ID ─────────────────────────────
  const renderEnterOrder = () => (
    <div className="card">
      <div className="card-body">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Enter Order ID
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Scan or type the Order ID to load products for{' '}
            <span className="font-medium text-gray-700">
              {currentSubstation.displayName}
            </span>
          </p>

          <div className="flex gap-2">
            <VoiceSearchInput
              value={orderIdInput}
              onChange={(e) => {
                setOrderIdInput(e.target.value);
                setError('');
              }}
              onSearch={(val) => {
                setOrderIdInput(val);
                setError('');
                handleLookupOrder();
              }}
              placeholder="e.g. ORD-001"
              inputWidth="w-full"
            />
            <button
              onClick={handleLookupOrder}
              className="btn-primary px-6"
              disabled={isSubmitting || !orderIdInput.trim()}
            >
              {isSubmitting ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                'Look Up'
              )}
            </button>
          </div>

          {error && step === STEP.ENTER_ORDER && (
            <div className="mt-4 flex items-center gap-2 justify-center text-red-600 text-sm">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              Available test orders:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['ORD-001', 'ORD-002', 'ORD-003', 'ORD-004'].map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setOrderIdInput(id);
                    setError('');
                  }}
                  className="px-3 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render: Step 2 – Processing Products (Multi-Batch) ──────────
  const renderProcessing = () => (
    <>
      {/* Order Info Card */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Order
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {order.orderNumber}
              </p>
              <p className="text-sm text-gray-500">{order.customer}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {totalProducts}
                </p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {completedProducts}
                </p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
              {mismatchProducts > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">
                    {mismatchProducts}
                  </p>
                  <p className="text-xs text-gray-500">Mismatch</p>
                </div>
              )}
              {pendingProducts > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-600">
                    {pendingProducts}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && step === STEP.PROCESSING && (
        <div className="card border-l-4 border-red-400 bg-red-50">
          <div className="card-body flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Products — Multi-Batch Cards */}
      <div className="space-y-4">
        {products.map((product, index) => {
          const isCompleted = product.status === 'COMPLETED';
          const totalBatchQty = product.batches.reduce(
            (s, b) => s + Number(b.quantity || 0),
            0
          );
          const qtyMatch = totalBatchQty === product.requiredQty;
          const hasMismatch =
            totalBatchQty > 0 && !qtyMatch && !isCompleted;
          const allBatchesFilled = product.batches.every(
            (b) => b.batchNumber.trim() && b.quantity
          );

          return (
            <div
              key={product.id}
              className={`card overflow-hidden transition-colors ${
                isCompleted
                  ? 'border-l-4 border-l-green-400 bg-green-50/30'
                  : hasMismatch
                  ? 'border-l-4 border-l-red-400 bg-red-50/30'
                  : 'border-l-4 border-l-yellow-400 bg-yellow-50/20'
              }`}
            >
              {/* Product Header */}
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted
                        ? 'bg-green-100 text-green-700'
                        : hasMismatch
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FiPackage
                        className={`w-4 h-4 flex-shrink-0 ${
                          isCompleted
                            ? 'text-green-500'
                            : hasMismatch
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : hasMismatch
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" /> Done
                        </span>
                      ) : hasMismatch ? (
                        <span className="inline-flex items-center gap-1">
                          <FiAlertTriangle className="w-3 h-3" /> Mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <FiXCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Required vs Processed Summary */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Required:</span>
                    <span className="font-bold text-gray-900">
                      {product.requiredQty}
                    </span>
                  </div>
                  <FiArrowLeft className="w-3 h-3 text-gray-300 rotate-180" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Batch Total:</span>
                    <span
                      className={`font-bold ${
                        qtyMatch
                          ? 'text-green-600'
                          : totalBatchQty > product.requiredQty
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {totalBatchQty}
                    </span>
                  </div>
                  {totalBatchQty > 0 && !qtyMatch && (
                    <span className="text-xs text-gray-500">
                      (diff: {totalBatchQty - product.requiredQty > 0 ? '+' : ''}
                      {totalBatchQty - product.requiredQty})
                    </span>
                  )}
                </div>

                {/* Batch Table */}
                {product.batches.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-10">
                            #
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Batch Number
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-28">
                            Quantity
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {product.batches.map((batch, bIdx) => (
                          <tr key={bIdx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-400">
                              {bIdx + 1}
                            </td>
                            <td className="px-3 py-2">
                              <VoiceInputField
                                type="text"
                                value={batch.batchNumber}
                                onChange={(e) =>
                                  updateBatch(
                                    product.id,
                                    bIdx,
                                    'batchNumber',
                                    e.target.value.toUpperCase()
                                  )
                                }
                                placeholder="e.g. BN-1234"
                                className={`input-field text-sm font-mono py-1.5 flex-1 ${
                                  isCompleted ? 'bg-gray-50' : ''
                                }`}
                                disabled={isCompleted}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <VoiceInputField
                                type="number"
                                value={batch.quantity}
                                onChange={(e) =>
                                  updateBatch(
                                    product.id,
                                    bIdx,
                                    'quantity',
                                    e.target.value
                                  )
                                }
                                className={`input-field text-center text-sm py-1.5 w-20 ${
                                  isCompleted ? 'bg-gray-50' : ''
                                }`}
                                disabled={isCompleted}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              {!isCompleted ? (
                                product.batches.length > 1 ? (
                                  <button
                                    onClick={() => removeBatch(product.id, bIdx)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove batch"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-300" title="Cannot remove the only batch">—</span>
                                )
                              ) : (
                                <FiCheck className="w-3.5 h-3.5 text-green-400 mx-auto" title="Completed" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Batch Actions */}
                {!isCompleted && (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => addBatch(product.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      Add Batch
                    </button>

                    {/* Raise Issue button — visible when there's a mismatch */}
                    {hasMismatch && (
                      <button
                        onClick={() => handleRaiseIssue(product)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <FiFlag className="w-3.5 h-3.5" />
                        Raise Issue
                        <FiExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    )}

                    {/* Info when all good */}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Quantity matches — ready to submit
                      </span>
                    )}

                    {!hasMismatch && !isCompleted && allBatchesFilled && qtyMatch && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Quantity matches
                      </span>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    Product processed successfully with {product.batches.length} batch(es)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={handleReset} className="btn-secondary">
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={isSubmitting || completedProducts !== totalProducts}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : completedProducts === totalProducts ? (
              <span className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                Submit Processing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                Submit ({completedProducts}/{totalProducts})
              </span>
            )}
          </button>
        </div>
      </div>

    </>
  );

  // ── Render: Step 3 – Completed ──────────────────────────────────
  const renderCompleted = () => (
    <div className="card">
      <div className="card-body">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Sub-Station Processing Complete
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            All products for{' '}
            <span className="font-medium text-gray-700">
              {currentSubstation.displayName}
            </span>{' '}
            have been processed successfully.
          </p>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order</span>
              <span className="text-gray-900 font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer</span>
              <span className="text-gray-900 font-medium">{order.customer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Products Processed</span>
              <span className="text-green-700 font-medium">
                {completedProducts} of {totalProducts}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Station</span>
              <span className="text-gray-900 font-medium">
                {currentSubstation.displayName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() =>
                navigate(`/final-bill/${order.orderNumber}`, {
                  state: {
                    orderId: order.orderNumber,
                    customer: order.customer,
                    substation: currentSubstation.displayName,
                    substationId: currentSubstation.id,
                    products: products,
                  },
                })
              }
              className="btn-primary flex items-center gap-2"
            >
              <FiFileText className="w-4 h-4" />
              Generate Bill
            </button>
            <button onClick={handleNewOrder} className="btn-secondary">
              Process Next Order
            </button>
            <button
              onClick={() => navigate('/sub-stations')}
              className="btn-secondary"
            >
              Back to Stations
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <button
            onClick={() => navigate('/sub-stations')}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700 mb-2"
          >
            <FiArrowLeft className="w-4 h-4 mr-1" />
            Back to Sub-Stations
          </button>
          <h1 className="page-title">{currentSubstation.displayName}</h1>
          <p className="page-subtitle">
            {currentSubstation.location} —{' '}
            <span
              className={`inline-flex items-center gap-1 ${
                statusCfg.color === 'success'
                  ? 'text-green-600'
                  : statusCfg.color === 'warning'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {statusCfg.icon} {statusCfg.label}
            </span>
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {stationId}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[
          { key: STEP.ENTER_ORDER, label: 'Enter Order' },
          { key: STEP.PROCESSING, label: 'Process Products' },
          { key: STEP.COMPLETED, label: 'Complete' },
        ].map((s, i) => (
          <React.Fragment key={s.key}>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.key
                  ? 'bg-primary-100 text-primary-700'
                  : [STEP.ENTER_ORDER, STEP.PROCESSING, STEP.COMPLETED].indexOf(step) > i
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {[STEP.ENTER_ORDER, STEP.PROCESSING, STEP.COMPLETED].indexOf(step) > i ? (
                <FiCheck className="w-3 h-3" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
                  {i + 1}
                </span>
              )}
              {s.label}
            </div>
            {i < 2 && (
              <div
                className={`w-8 h-0.5 ${
                  [STEP.ENTER_ORDER, STEP.PROCESSING, STEP.COMPLETED].indexOf(step) > i
                    ? 'bg-green-300'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {step === STEP.ENTER_ORDER && renderEnterOrder()}
      {step === STEP.PROCESSING && renderProcessing()}
      {step === STEP.COMPLETED && renderCompleted()}
    </div>
  );
}
