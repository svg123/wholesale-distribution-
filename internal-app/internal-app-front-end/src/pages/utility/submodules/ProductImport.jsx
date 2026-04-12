import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, updateProduct, deleteProduct, importProducts } from '../../../redux/slices/utilitySlice';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { FormField, FormSection, FormActions } from '../components/FormFields';
import useForm from '../components/useForm';
import { ConfirmDialog } from '../components/FormModal';
import CsvImportButton from '../components/CsvImportButton';

const MEDICINE_SIZES = ['10 tablets', '15 tablets', '20 tablets', '30 tablets', '50 tablets', '100 tablets', '100ml', '250ml', '500ml', '1000ml', '50gm', '100gm', '250gm', '500gm'];
const MEDICINE_TYPES = ['Strip', 'Bottle', 'Tube', 'Cream', 'Syrup', 'Injection', 'Drops', 'Capsule'];
const BRAND_TYPES = ['ETHICAL', 'GENERIC', 'OTC', 'SURGICAL', 'VETERINARY', 'STANDARD', 'GENERAL'];

const emptyForm = {
  id: '', name: '', size: '', brandId: '', brandName: '', brandType: '',
  medicineType: '', gst: '', scheme: '', schemeEnabled: false, composition: '', status: 'Active',
};

const statusColors = {
  Active: 'bg-green-50 text-green-700',
  Inactive: 'bg-red-50 text-red-700',
};

export default function ProductImport() {
  const dispatch = useDispatch();
  const { products, brands } = useSelector((state) => state.utility);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, errors, handleChange, reset, validate, setValue, setMultipleValues } = useForm(emptyForm);

  const columns = [
    { header: 'Product ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Size', accessor: 'size' },
    { header: 'Brand', accessor: 'brandName' },
    { header: 'GST %', accessor: 'gst', render: (row) => `${row.gst}%` },
    { header: 'Scheme', accessor: 'scheme', render: (row) => (
      row.schemeEnabled && row.scheme ? (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{row.scheme}</span>
      ) : (
        <span className="text-xs text-gray-400">None</span>
      )
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status] || ''}`}>{row.status}</span>
    )},
  ];

  const validationRules = {
    id: { required: true, message: 'Product ID is required' },
    name: { required: true, message: 'Product Name is required' },
    size: { required: true, message: 'Size is required' },
    brandId: { required: true, message: 'Brand is required' },
    medicineType: { required: true, message: 'Medicine Type is required' },
    gst: { required: true, message: 'GST Slab is required' },
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    const brand = brands.find((b) => b.id === brandId);
    setMultipleValues({
      brandId,
      brandName: brand?.name || '',
      brandType: brand?.type || '',
    });
  };

  const handleAdd = () => { setEditingItem(null); reset(); setModalOpen(true); };
  const handleEdit = (item) => {
    setEditingItem(item);
    Object.keys(emptyForm).forEach((key) => setValue(key, item[key] ?? ''));
    setModalOpen(true);
  };
  const handleDeleteClick = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleConfirmDelete = () => { dispatch(deleteProduct(deleteId)); };

  const handleSave = () => {
    if (!validate(validationRules)) return;
    const payload = { ...values, gst: Number(values.gst), schemeEnabled: values.schemeEnabled === true || values.schemeEnabled === 'true' };
    if (editingItem) { dispatch(updateProduct(payload)); } else { dispatch(addProduct(payload)); }
    setModalOpen(false);
    reset();
  };

  const brandOptions = brands.map((b) => ({ value: b.id, label: `${b.name} (${b.type})` }));

  return (
    <div>
      <DataTable
        title="Product Import"
        columns={columns}
        data={products}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchPlaceholder="Search products..."
        addLabel="Add Product"
        emptyMessage="No products added yet."
      />

      <CsvImportButton
        onImport={(data) => dispatch(importProducts(data))}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'size', header: 'Size' },
          { key: 'brandName', header: 'Brand' },
          { key: 'gst', header: 'GST' },
          { key: 'status', header: 'Status' },
        ]}
        requiredFields={['id', 'name']}
        sampleColumns="product_id, product_name, medicine_size, brand_id, medicine_type, gst_slab, scheme_structure, scheme_enabled, composition, product_status"
        mapRow={(raw) => {
          const product = {
            id: raw.product_id || raw.id || '',
            name: raw.product_name || raw.name || '',
            size: raw.medicine_size || raw.size || '',
            brandId: raw.brand_id || '',
            brandName: raw.brand_name || '',
            brandType: raw.brand_type || '',
            medicineType: raw.medicine_type || '',
            gst: Number(raw.gst_slab || raw.gst || 0),
            scheme: raw.scheme_structure || '',
            schemeEnabled: raw.scheme_enabled === 'true' || raw.scheme_enabled === '1',
            composition: raw.composition || '',
            status: raw.product_status === 'false' || raw.product_status === '0' ? 'Inactive' : 'Active',
          };
          if (!product.id || !product.name) return null;
          const brandExists = brands.find((b) => b.id === product.brandId);
          if (brandExists) {
            product.brandName = brandExists.name;
            product.brandType = brandExists.type;
          } else if (product.brandId) {
            product.brandName = product.brandId;
          }
          return product;
        }}
      />

      {/* Add/Edit Product Modal */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="space-y-6">
          <FormSection title="Product Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Product ID" name="id" value={values.id} onChange={handleChange} required placeholder="e.g., PROD-004" disabled={!!editingItem} error={errors.id} />
              <FormField label="Product Name" name="name" value={values.name} onChange={handleChange} required placeholder="e.g., Amoxicillin 500mg" error={errors.name} />
              <FormField label="Medicine Size" name="size" value={values.size} onChange={handleChange} type="select" required options={MEDICINE_SIZES} error={errors.size} />
              <FormField label="Medicine Type" name="medicineType" value={values.medicineType} onChange={handleChange} type="select" required options={MEDICINE_TYPES} error={errors.medicineType} />
              <FormField label="GST Slab" name="gst" value={values.gst} onChange={handleChange} type="select" required options={[5, 12, 18, 28].map((g) => ({ value: g, label: `${g}%` }))} error={errors.gst} />
              <FormField label="Drug Composition" name="composition" value={values.composition} onChange={handleChange} placeholder="e.g., Amoxicillin 500mg" />
            </div>
          </FormSection>

          <FormSection title="Brand & Scheme">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Brand" name="brandId" value={values.brandId} onChange={handleBrandChange} type="select" required options={brandOptions} error={errors.brandId} />
              <FormField label="Brand Type" name="brandType" value={values.brandType} disabled hint="Auto-filled from brand" />
              <FormField label="Scheme (e.g., 10+1)" name="scheme" value={values.scheme} onChange={handleChange} placeholder="e.g., 10+1 or 25+3,50+6" hint="Format: qty+free for each tier" />
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer py-2.5">
                  <input
                    type="checkbox"
                    checked={values.schemeEnabled === true || values.schemeEnabled === 'true'}
                    onChange={(e) => setValue('schemeEnabled', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Scheme Enabled</span>
                </label>
              </div>
            </div>
          </FormSection>

          <FormSection title="Status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Product Status" name="status" value={values.status} onChange={handleChange} type="select" options={['Active', 'Inactive']} />
            </div>
          </FormSection>

          <FormActions onCancel={() => setModalOpen(false)} onSave={handleSave} saveLabel={editingItem ? 'Update Product' : 'Add Product'} />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure? This product cannot be deleted if it has active stock rules."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
