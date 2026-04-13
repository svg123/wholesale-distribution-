import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  setReturnType,
  setInvoiceId,
  addCreditNoteItem,
  updateCreditNoteItem,
  removeCreditNoteItem,
  setCreditNoteNotes,
  resetForm,
  loadFormFromCreditNote,
  createCreditNoteStart,
  createCreditNoteSuccess,
  createCreditNoteFailure,
  updateCreditNoteStart,
  updateCreditNoteSuccess,
  updateCreditNoteFailure,
  submitCreditNoteStart,
  submitCreditNoteSuccess,
  submitCreditNoteFailure,
  fetchInvoicesStart,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchProductBatchesStart,
  fetchProductBatchesSuccess,
  fetchProductBatchesFailure,
  fetchCreditNoteDetailStart,
  fetchCreditNoteDetailSuccess,
  fetchCreditNoteDetailFailure,
  fetchConfigStart,
  fetchConfigSuccess,
  fetchConfigFailure,
  clearError,
} from '../redux/slices/creditNoteSlice';
import creditNoteService from '../services/creditNoteService';
import ReturnTypeSelector from '../components/CreditNote/ReturnTypeSelector';
import InvoiceSelector from '../components/CreditNote/InvoiceSelector';
import ProductBatchSelector from '../components/CreditNote/ProductBatchSelector';
import CreditNoteItems from '../components/CreditNote/CreditNoteItems';

export default function CreateCreditNote() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // If editing an existing credit note
  const isEditing = Boolean(id);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { form, invoices, productBatches, config, isLoading, error } = useSelector((state) => state.creditNote);

  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState('');
  const [submitMode, setSubmitMode] = useState(null); // 'draft' or 'submit'

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch config and invoices
    dispatch(fetchConfigStart());
    creditNoteService
      .getConfig()
      .then((data) => dispatch(fetchConfigSuccess(data)))
      .catch((err) => dispatch(fetchConfigFailure(err.message)));

    dispatch(fetchInvoicesStart());
    creditNoteService
      .getInvoices()
      .then((data) => dispatch(fetchInvoicesSuccess(data)))
      .catch((err) => dispatch(fetchInvoicesFailure(err.message)));

    // If editing, load existing credit note
    if (id) {
      dispatch(fetchCreditNoteDetailStart());
      creditNoteService
        .getById(id)
        .then((data) => {
          dispatch(fetchCreditNoteDetailSuccess(data));
          dispatch(loadFormFromCreditNote(data));
          setStep(3); // Jump to items step
        })
        .catch((err) => dispatch(fetchCreditNoteDetailFailure(err.message)));
    }

    return () => {
      dispatch(resetForm());
      dispatch(clearError());
    };
  }, [id, isAuthenticated, navigate, dispatch]);

  // Fetch batches when invoice is selected
  const handleInvoiceSelect = (invoiceId) => {
    dispatch(setInvoiceId(invoiceId));
    // Load invoice items as available batches
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice?.items) {
      invoice.items.forEach((item) => {
        dispatch(fetchProductBatchesStart());
        // Simulate: in real app, call API
        dispatch(
          fetchProductBatchesSuccess({
            productId: item.productId,
            batches: item.batches || [
              {
                batchNumber: item.batchNumber,
                purchasedQuantity: item.quantity,
                returnedQuantity: 0,
                unitPrice: item.unitPrice,
                expiryDate: item.expiryDate,
              },
            ],
          })
        );
      });
    }
  };

  const handleAddItem = (item) => {
    // Check for duplicate product+batch
    const exists = form.items.some(
      (existing) => existing.productId === item.productId && existing.batchNumber === item.batchNumber
    );
    if (exists) {
      setLocalError('This product+batch combination already exists in the credit note.');
      return;
    }
    dispatch(addCreditNoteItem(item));
    setLocalError('');
  };

  const canSave = form.items.length > 0;
  const totalAmount = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSave = async (mode) => {
    if (!canSave) return;
    setSubmitMode(mode);
    setLocalError('');

    const payload = {
      returnType: form.returnType,
      invoiceId: form.invoiceId,
      items: form.items,
      notes: form.notes,
      totalAmount,
      action: mode, // 'draft' or 'submit'
    };

    try {
      if (isEditing) {
        dispatch(updateCreditNoteStart());
        const data = await creditNoteService.update(id, payload);
        dispatch(updateCreditNoteSuccess(data));
      } else {
        dispatch(createCreditNoteStart());
        const data = await creditNoteService.create(payload);
        dispatch(createCreditNoteSuccess(data));
      }
      navigate('/credit-notes');
    } catch (err) {
      if (isEditing) {
        dispatch(updateCreditNoteFailure(err.message));
      } else {
        dispatch(createCreditNoteFailure(err.message));
      }
      setLocalError(err.message);
    }
  };

  const steps = [
    { num: 1, label: 'Return Type' },
    { num: 2, label: 'Select Invoice' },
    { num: 3, label: 'Add Products' },
    { num: 4, label: 'Review & Submit' },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/credit-notes')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Credit Note' : 'Create Credit Note'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {isEditing ? 'Modify your credit note details' : 'Return products and create a credit note'}
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center mt-6">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Display */}
          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
              {localError || error}
            </div>
          )}

          {/* Step 1: Return Type */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <ReturnTypeSelector
                selected={form.returnType}
                onSelect={(type) => {
                  dispatch(setReturnType(type));
                  setStep(2);
                }}
                enabledTypes={config.enabledReturnTypes}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => form.returnType && setStep(2)}
                  disabled={!form.returnType}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Invoice Selection */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <InvoiceSelector
                invoices={invoices}
                selectedInvoiceId={form.invoiceId}
                onSelect={handleInvoiceSelect}
                isLoading={isLoading}
              />
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => form.invoiceId && setStep(3)}
                  disabled={!form.invoiceId}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Product & Batch Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <ProductBatchSelector
                  invoiceItems={invoices.find((inv) => inv.id === form.invoiceId)?.items || []}
                  productBatches={productBatches}
                  returnType={form.returnType}
                  onAddItem={handleAddItem}
                  isLoadingBatches={isLoading}
                  expiryClaimWindow={config.expiryClaimWindow}
                />
              </div>

              {/* Added Items */}
              {form.items.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <CreditNoteItems
                    items={form.items}
                    onUpdateItem={(index, data) => dispatch(updateCreditNoteItem({ index, data }))}
                    onRemoveItem={(index) => dispatch(removeCreditNoteItem(index))}
                    isEditable={!isEditing}
                  />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => form.items.length > 0 && setStep(4)}
                  disabled={form.items.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review ({form.items.length} item(s))
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Review Credit Note</h2>

                {/* Return Type & Invoice */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Return Type</p>
                    <p className="font-semibold text-gray-900">
                      {form.returnType === 'EXPIRY' ? '📅 Expiry' : form.returnType === 'BREAKAGE_DAMAGE' ? '💔 Breakage/Damage' : '✅ Good Return'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Invoice</p>
                    <p className="font-semibold text-gray-900">
                      {invoices.find((inv) => inv.id === form.invoiceId)?.invoiceNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <CreditNoteItems items={form.items} isEditable={false} />

                {/* Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => dispatch(setCreditNoteNotes(e.target.value))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    placeholder="Any additional information about this credit note..."
                  />
                </div>

                {/* Total */}
                <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Total Credit Amount</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Edit
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={isLoading}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isLoading && submitMode === 'draft' ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={() => handleSave('submit')}
                    disabled={isLoading}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading && submitMode === 'submit' ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
