import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addScheme, updateScheme, deleteScheme, importSchemes } from '../../../redux/slices/utilitySlice';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { FormField, FormSection, FormActions } from '../components/FormFields';
import useForm from '../components/useForm';
import { ConfirmDialog } from '../components/FormModal';
import CsvImportButton from '../components/CsvImportButton';

const emptyForm = {
  id: '',
  productId: '',
  productName: '',
  tier1Qty: '',
  tier1Free: '',
  tier2Qty: '',
  tier2Free: '',
  tier3Qty: '',
  tier3Free: '',
};

export default function SchemeEntry() {
  const dispatch = useDispatch();
  const { schemes, products } = useSelector((state) => state.utility);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, errors, handleChange, reset, validate, setValue, setMultipleValues } = useForm(emptyForm);

  const columns = [
    { header: 'Scheme ID', accessor: 'id' },
    { header: 'Product', accessor: 'productName' },
    { header: 'Tier 1', accessor: 'tier1', render: (row) => formatTier(row.tier1) },
    { header: 'Tier 2', accessor: 'tier2', render: (row) => formatTier(row.tier2) },
    { header: 'Tier 3', accessor: 'tier3', render: (row) => formatTier(row.tier3) },
  ];

  function formatTier(tier) {
    if (!tier || !tier.qty) return <span className="text-xs text-gray-400">—</span>;
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
        Buy {tier.qty} + {tier.free} Free
      </span>
    );
  }

  const validationRules = {
    productId: { required: true, message: 'Product is required' },
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    setMultipleValues({
      productId,
      productName: product?.name || '',
    });
  };

  const handleAdd = () => { setEditingItem(null); reset(); setModalOpen(true); };
  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('id', item.id);
    setValue('productId', item.productId);
    setValue('productName', item.productName);
    setValue('tier1Qty', item.tier1?.qty || '');
    setValue('tier1Free', item.tier1?.free || '');
    setValue('tier2Qty', item.tier2?.qty || '');
    setValue('tier2Free', item.tier2?.free || '');
    setValue('tier3Qty', item.tier3?.qty || '');
    setValue('tier3Free', item.tier3?.free || '');
    setModalOpen(true);
  };
  const handleDeleteClick = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleConfirmDelete = () => { dispatch(deleteScheme(deleteId)); };

  const handleSave = () => {
    if (!validate(validationRules)) return;

    const schemeData = {
      id: editingItem ? values.id : `SCH-${String(schemes.length + 1).padStart(3, '0')}`,
      productId: values.productId,
      productName: values.productName,
      tier1: { qty: Number(values.tier1Qty) || 0, free: Number(values.tier1Free) || 0 },
      tier2: { qty: Number(values.tier2Qty) || 0, free: Number(values.tier2Free) || 0 },
      tier3: { qty: Number(values.tier3Qty) || 0, free: Number(values.tier3Free) || 0 },
    };

    if (editingItem) { dispatch(updateScheme(schemeData)); } else { dispatch(addScheme(schemeData)); }
    setModalOpen(false);
    reset();
  };

  const productOptions = products
    .filter((p) => p.status === 'Active')
    .map((p) => ({ value: p.id, label: `${p.name} (${p.brandName})` }));

  return (
    <div>
      <DataTable
        title="Scheme Structure Entry"
        columns={columns}
        data={schemes}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchPlaceholder="Search schemes..."
        addLabel="Add Scheme"
        emptyMessage="No schemes defined yet."
      />

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Scheme' : 'Add Scheme'} size="md">
        <div className="space-y-6">
          <FormSection title="Product Selection">
            <FormField
              label="Product"
              name="productId"
              value={values.productId}
              onChange={handleProductChange}
              type="select"
              required
              options={productOptions}
              error={errors.productId}
              placeholder="Select a product"
            />
          </FormSection>

          <FormSection title="Scheme Tiers (Buy X, Get Y Free)">
            <div className="space-y-4">
              {/* Tier 1 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tier 1</h5>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Purchase Qty" name="tier1Qty" value={values.tier1Qty} onChange={handleChange} type="number" placeholder="e.g., 10" />
                  <FormField label="Free Qty" name="tier1Free" value={values.tier1Free} onChange={handleChange} type="number" placeholder="e.g., 1" />
                </div>
              </div>
              {/* Tier 2 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tier 2</h5>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Purchase Qty" name="tier2Qty" value={values.tier2Qty} onChange={handleChange} type="number" placeholder="e.g., 25" />
                  <FormField label="Free Qty" name="tier2Free" value={values.tier2Free} onChange={handleChange} type="number" placeholder="e.g., 3" />
                </div>
              </div>
              {/* Tier 3 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tier 3</h5>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Purchase Qty" name="tier3Qty" value={values.tier3Qty} onChange={handleChange} type="number" placeholder="e.g., 50" />
                  <FormField label="Free Qty" name="tier3Free" value={values.tier3Free} onChange={handleChange} type="number" placeholder="e.g., 6" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Leave qty as 0 to skip a tier.</p>
          </FormSection>

          <FormActions onCancel={() => setModalOpen(false)} onSave={handleSave} saveLabel={editingItem ? 'Update Scheme' : 'Save Scheme'} />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Scheme"
        message="Are you sure you want to delete this scheme? This may affect stock calculations."
        confirmLabel="Delete"
        danger
      />

      <CsvImportButton
        onImport={(data) => dispatch(importSchemes(data))}
        columns={[
          { key: 'id', header: 'Scheme ID' },
          { key: 'productName', header: 'Product' },
          { key: 'tier1', header: 'Tier 1' },
          { key: 'tier2', header: 'Tier 2' },
          { key: 'tier3', header: 'Tier 3' },
        ]}
        requiredFields={['productId', 'productName']}
        sampleColumns="id, product_id, product_name, tier1_qty, tier1_free, tier2_qty, tier2_free, tier3_qty, tier3_free"
        mapRow={(raw) => {
          const product = products.find((p) => p.id === (raw.product_id || raw.productid || ''));
          return {
            id: raw.id || raw.scheme_id || `SCH-${Date.now()}`,
            productId: raw.product_id || raw.productid || '',
            productName: product?.name || raw.product_name || raw.productname || '',
            tier1: { qty: Number(raw.tier1_qty || raw.tier1qty || 0), free: Number(raw.tier1_free || raw.tier1free || 0) },
            tier2: { qty: Number(raw.tier2_qty || raw.tier2qty || 0), free: Number(raw.tier2_free || raw.tier2free || 0) },
            tier3: { qty: Number(raw.tier3_qty || raw.tier3qty || 0), free: Number(raw.tier3_free || raw.tier3free || 0) },
          };
        }}
      />
    </div>
  );
}
